const axios = require('axios');
const prompt = require('prompt');
const colors = require('colors/safe');

const constants = require('./config.json');

const getToken = async () => {
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', constants.CLIENT_ID);
    params.append('client_secret', constants.CLIENT_SECRET);
    let config = {
      method: 'post',
      url: constants.TOKEN_URL,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: params,
    };
    let res = await axios(config);
    return res.data;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

const invokeConnectivityAPI = async (method, endpoint, body = {}) => {
  try {
    const token = await getToken();
    let requestConfig = {
      method,
      url: constants.CPRO_BASEURL + endpoint,
      headers: {
        Authorization: 'Bearer ' + token.access_token,
        'x-api-key': constants.API_KEY,
      },
    };
    if (body && Object.keys(body).length > 0) {
      requestConfig.data = body;
    }
    let res = await axios(requestConfig);
    return res.data;
  } catch (error) {
   return({code:error.response.status,error:error.response.data});
  }
};

const formRequest = async (
  activationProfileId,
  eid,
  accountId,
  imei = null
) => {
  try {
    let reqObj = {};
    let subscriptions=[];
    const eids=eid.split(',');
    for(let eid of eids){
      let subObj={};
      if(imei){
        subObj={
          eid,
          imei
        }
      }else{
        subObj={
          eid
        }
      }
      subscriptions.push(subObj);
    }
    reqObj={
      'activation-profile-id': activationProfileId,
      subscriptions
    }
    console.log(colors.yellow('Requesting profile switch. Please wait...'));
    const res = await invokeConnectivityAPI(
      'POST',
      `/v1/accounts/${accountId}/esim-profile-switch-requests`,
      reqObj
    );
    // console.log('res ', res);
      if(res && res.status==="success" && res.data['esim-profile-switch-request-id']){
        console.log(
          colors.green(
            'Request successfully placed. Please note the reference Id : ',
            res.data['esim-profile-switch-request-id']
          )
        );
        console.log(colors.yellow('Requesting a status update. Please wait...'));
        let status = true;
        while (status) {
          const statusRes = await getStatus(res.data['esim-profile-switch-request-id'], accountId);
          if (
            statusRes &&
            statusRes['switch-request-status'] &&
            statusRes['switch-request-status'] === 'Completed' ||
            statusRes['switch-request-status'] === 'Processed'
          ) {
            status = false;
          }
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        if (!status) {
          console.log('statusRes ', statusRes);
          console.lof(
            colors.magenta('Request has been completed successfully :', statusRes)
          );
        }
      }
      if(res && res.error && res.error.status==="error" ){
        console.error( colors.red('Sorry something went wrong!..Please find the error below'));
        console.error(colors.red(res.error))
      }

  } catch (error) {
    console.error( colors.red('Sorry something went wrong!..Please find the error below'));
    console.error(colors.red(error));
  }
};

const getStatus = async (switchRequestId, accountId) => {
  try {
    const res = await invokeConnectivityAPI(
      'GET',
      `/v1/accounts/${accountId}/esim-profile-switch-requests/${switchRequestId}`,
      {}
    );
    return res;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

const switchProfile = async (email) => {
  try {
    let accountId = '';
    let imei="";
    const getAccounts = await invokeConnectivityAPI(
      'GET',
      `/v1/accounts?email=${email}`,
      {}
    );
    // Assuming  we'll grab the first account from the accounts list  in case the user has parent/child
    if (getAccounts && getAccounts.account && getAccounts.account.length > 0) {
      accountId = getAccounts.account[0]['account-id'];
    }
    const schema = {
      properties: {
          operation: {
          description: colors.magenta('Welcome to ESim Switch Management Console ')+('\n')+colors.green('Please select your desired option 1 or 2 ?')+('\n')+colors.cyan('1.Switch a VZW Profile')+('\n') +colors.cyan('2.Switch non VZW Profile')+('\n'),
          pattern:/^\b(1|2)\b/,
          message: 'Operation must be '+colors.red('1,or 2'),
          required: true,
          type:'string'
        }
      }
    };
    const EIDSchema = {
      properties: {
        EID: {
          description: colors.magenta(
            'Please enter your desired EIDs in a comma separated format :'
          )+('\n'),
          pattern: /^[a-zA-Z0-9\,]+$/,
          message: 'EID must be a string',
          required: true,
          type: 'string',
        },
      },
    };
    const ProfileSchema = {
      properties: {
        profileId: {
          description: colors.magenta(
            'Please enter your activation-profile-id :'
          ),
          pattern: /^[a-zA-Z0-9-]+$/,
          message: colors.red('activation-profile-id  must be a string'),
          required: true,
          type: 'string',
        },
      },
    };
    const IMEISchema = {
      properties: {
        imei: {
          description: colors.magenta('Please enter your IMEI :'),
          pattern: /^[a-zA-Z0-9]+$/,
          message: colors.red('imei  must be a string'),
          required: true,
          type: 'string',
        },
      },
    };
    prompt.message = '';
    prompt.delimiter = '';
    prompt.start();

    const { operation } = await prompt.get(schema);
    if (operation && operation === '1') {
      imei = await prompt.get(IMEISchema);
      console.log(colors.green('IMEI successfully entered'));
    }
    const { EID } = await prompt.get(EIDSchema);
    if (EID && typeof EID === 'string') {
      console.log(colors.green('EID values successfully entered'));
      const { profileId } = await prompt.get(ProfileSchema);
      console.log(colors.green('ProfileId successfully entered'));
      const switchProfile = await formRequest(
        profileId,
        EID,
        accountId,
        imei.imei || null
      );
    }
  } catch (error) {
    console.log('Something went wrong ', error);
  }
};


// Invoke the application by passing email-id
switchProfile('<<EMAIL_ID>>');
