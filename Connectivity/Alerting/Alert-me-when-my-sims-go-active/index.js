const axios= require('axios');
const prompt = require('prompt');
const csv = require('csv-parser');
const fs = require('fs');
const colors = require('colors/safe');
const util = require('util')


const constants= require('./config.json');


const getToken=async()=>{
    try{
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
}catch(error){
    console.error(error);
    throw new Error(error);
}
}


const invokeConnectivityAPI=async(method,body={},endpoint,token)=>{
    try{
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
}catch(error){
    console.error(error);
    throw new Error(error);
}
}

const ruleOperation=async(accountId,ruleId="",modify=false)=>{
    try{
    const token= await getToken();
    const results = [];
    fs.createReadStream('data.csv')
    .pipe(csv(['iccid']))
    .on('data', (data) => 
        results.push(data.iccid))
    .on('end', async() => {
        if(results && results.length>0){
            const getIds=await getSubscriptionIds(accountId,results,token) ;
            if(getIds && getIds.length>0){
                const rule={
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
                            "attribute-value": `${getIds.join(',')}`
                        },
                    ],
                    "actions": {
                        "webhook": {
                            "webhook-url": "https://my-listener.com/listen"
                        }
                    }
                }
                if(!modify){
                    const resp=await createRule(rule,accountId,token);
                    console.log('Response ',resp);
                }else{
                    const resp= await updateRule(rule,accountId,ruleId,token);
                    console.log('Response ',resp);
                }
            }
            
        }
    });
}catch(error){
    console.error(error);
    throw new Error(error);
}
}

const getSubscriptionIds=async(accountId,iccid,token)=>{
    try{
    let subIds=[];
    for(let id of iccid){
        const subscriptionTag= await invokeConnectivityAPI('GET',{},`/v1/accounts/${accountId}/subscriptions?page-index=0&max-page-item=10&iccid=${id}`,token);
        if(subscriptionTag && subscriptionTag.subscriptions && subscriptionTag.subscriptions.length>0){
            subIds.push(subscriptionTag.subscriptions[0]['subscription-id']);
        }
    }
    return subIds;
}catch(error){
    console.error(error);
    throw new Error(error);
}
}

const createRule=async(rule,accountId,token)=>{
    try{
    const create= await invokeConnectivityAPI('POST',rule,`/v1/accounts/${accountId}/rules`,token);
    return create;
}catch(error){
    console.error(error);
    throw new Error(error);
}

}
const updateRule=async(rule,accountId,ruleId,token)=>{
    try{
    const update= await invokeConnectivityAPI('PUT',rule,`/v1/accounts/${accountId}/rules/${ruleId}`,token);
    return update;
}catch(error){
    console.error(error);
    throw new Error(error);
}

}


const alertMe=async(email)=>{
    try{
    const token= await getToken();
    let accountId="";
    const getAccounts= await invokeConnectivityAPI('GET',{},`/v1/accounts?email=${email}`,token);
    // Assuming  we'll grab the first account from the accounts list  in case the user has parent/child
    if(getAccounts && getAccounts.account && getAccounts.account.length>0){
        accountId=getAccounts.account[0]['account-id']
    }
    const schema = {
        properties: {
            operation: {
            description: colors.magenta('What operation do you want to perform ? ')+colors.yellow('Please select 1 ,2 or 3')+('\n')+colors.cyan('1.Create a new rule')+('\n') +colors.cyan('2.List all rules')+('\n')+colors.cyan('3.Modify a rule')+('\n'),
            pattern:/^\b(1|2|3)\b/,
            message: 'Operation must be '+colors.red('1,2 or 3'),
            required: true,
            type:'string'
          }
        }
      };
      const modifySchema = {
        properties: {
            ruleId: {
            description: colors.magenta('Please enter your rule-id :'),
            pattern: /^[0-9]+$/,
            message: colors.red('Rule id  must be a valid number'),
            required: true,
            type:'string'
          }
        }
      };
  prompt.message="";
  prompt.delimiter="";
  prompt.start();

  const {operation} = await prompt.get(schema);
  if(operation==='1'){
      console.log(colors.green('Create a new rule initiated....'));
      const create= await ruleOperation(accountId);
  }else if(operation==='2'){
    console.log(colors.green('List all rules initiated.... '));
    const rules= await invokeConnectivityAPI('GET',{},`/v1/accounts/${accountId}/rules`,token);
    console.log('Rules list : ',util.inspect(rules, false, null, true))
  }else if(operation==='3'){
    const {ruleId} = await prompt.get(modifySchema);
    console.log(colors.green('Modify a rule initiated.... '));
    const modify= await ruleOperation(accountId,ruleId,true);
  }
}catch(error){
    console.log('Something went wrong ',error);
}
}

// Invoke the application by passing email-id 
alertMe("<<EMAIL_ID>>");
