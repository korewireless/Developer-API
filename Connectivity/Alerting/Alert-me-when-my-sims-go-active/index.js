const axios= require('axios');

const constants= require('./config.json');


const getToken=async()=>{
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', constants.CLIENT_ID);
    params.append('client_secret', constants.CLIENT_SECRET);
    let config={
        method:"post",
        url:constants.TOKEN_URL,
        headers:{
            "Content-Type": "application/x-www-form-urlencoded"
        },
        data: params
    }
    let res = await axios(config);
    return res.data;
}


const invokeConnectivityAPI=async(method,body={},endpoint,token)=>{
    let requestConfig={
        method,
        url: constants.CPRO_BASEURL+endpoint,
        headers: {
            Authorization: "Bearer " + token.access_token,
            'x-api-key':constants.API_KEY
          }
    }
    if(body && Object.keys(body).length>0){
        requestConfig.data=body;
    }
    let res = await axios(requestConfig);
    return res.data;
}

const alertMe=async(email,iccid)=>{
    try{
    // Get the access_token
    console.log("Obtain the access_token");
    const token= await getToken();
    console.log('access_token received ',token);
    // Obtain account-id
    console.log('Fetching account ids');
    const getAccounts= await invokeConnectivityAPI('GET',{},`/v1/accounts?email=${email}`,token);
    // console.log('accounts ',getAccounts);
    if(getAccounts && getAccounts.account && getAccounts.account.length>0){
    console.log('Account ids fetched successfully ',getAccounts);
    // Get the subscription-id by providing account-id and ICCID as parameters
    console.log('Fetching Subscription tags');
    const subscriptionTag= await invokeConnectivityAPI('GET',{},`/v1/accounts/${getAccounts.account[0]['account-id']}/subscriptions?page-index=0&max-page-item=10&iccid=${iccid}`,token);
    console.log('subscriptionTag ',JSON.stringify(subscriptionTag));
    // Build a rule for desired action (here Stock to Active)
    console.log('Create a new rule');
    const rule={
        "rule-name": "Stock to Active State Change Rule",
        "event-name": "connectivity.subscription.state.changed",
        "enabled": true,
        "conditions": [
            {
                "attribute-name": "old-state",
                "condition-operator": "==",
                "attribute-value": "Stock" // Replace with your old state
            },
            {
                "attribute-name": "new-state",
                "condition-operator": "==",
                "attribute-value": "Active" // Replace with your new state
            },
            {
                "attribute-name": "subscription-id",
                "condition-operator": "==",
                "attribute-value": subscriptionTag.subscriptions[0]['subscription-id'] // Replace with your desired subscription id if required
            },
        ],
        "actions": {
            "webhook": {
                "webhook-url": "https://connectivity-pro.requestcatcher.com/test" // Replace with your cloud listener URL 
            }
        }
    }
    
    const createRule= await invokeConnectivityAPI('POST',rule,`/v1/accounts/${getAccounts.account[0]['account-id']}/rules`,token);
    console.log('New rule has been created ',createRule);
    // Update an existing rule (Here we have updated the old rule with multiple subscription ids)
    console.log('Update an existing rule');
    const modifiedRule={
        "rule-name": "Stock to Active State Change Rule",
        "event-name": "connectivity.subscription.state.changed",
        "enabled": true,
        "conditions": [
            {
                "attribute-name": "old-state",
                "condition-operator": "==",
                "attribute-value": "Stock"
            },
            {
                "attribute-name": "new-state",
                "condition-operator": "==",
                "attribute-value": "Active"
            },
            {
                "attribute-name": "subscription-id",
                "condition-operator": "in",
                "attribute-value": "cmp-k1-subscription-16000001,cmp-k1-subscription-16000002,cmp-k1-subscription-25000001"
            },
        ],
        "actions": {
            "webhook": {
                "webhook-url": "https://connectivity-pro.requestcatcher.com/test"
            }
        }
    }
    const updateRule= await invokeConnectivityAPI('PUT',modifiedRule,`/v1/accounts/${getAccounts.account[0]['account-id']}/rules/${createRule['rule-id']}`,token);
    console.log('Rule has been updated successfully ',updateRule);
    // const updateRule= await invokeConnectivityAPI('PUT',modifiedRule,`v1/accounts/${getAccounts.account[0]['account-id']}/rules/18`,token);
    // console.log('Rule has been updated successfully ',updateRule);
}
return "No account-id is available";
}catch(error){
    console.log('Something went wrong ',error);
}
}

// Invoke the application by passing email-id and ICCID
alertMe('mjayaraj@korewireless.com','9999990160100000010');