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
    const token= await getToken();
    // Obtain account-id
    const getAccounts= await invokeConnectivityAPI('GET',{},`/v1/accounts?email=${email}`,token);
    if(getAccounts && getAccounts.account && getAccounts.account.length>0){
    // Get the subscription-id by providing account-id and ICCID as parameters
    const subscriptionTag= await invokeConnectivityAPI('GET',{},`/v1/accounts/${getAccounts.account[0]['account-id']}/subscriptions?page-index=0&max-page-item=10&iccid=${iccid}`,token);
    // Build a rule for desired action (here Stock to Active)
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
                "webhook-url": "https://my-listener.com/listen" // Replace with your cloud listener URL 
            }
        }
    }
    
    const createRule= await invokeConnectivityAPI('POST',rule,`/v1/accounts/${getAccounts.account[0]['account-id']}/rules`,token);
    // Update an existing rule (Here we have updated the old rule with multiple subscription ids)
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
                "attribute-value": "cmp-xx-subscription-160xxxx,cmp-xx-subscription-160xxxx,cmp-xx-subscription-250xxxx"
            },
        ],
        "actions": {
            "webhook": {
                "webhook-url": "https://my-listener.com/listen"
            }
        }
    }
    const updateRule= await invokeConnectivityAPI('PUT',modifiedRule,`/v1/accounts/${getAccounts.account[0]['account-id']}/rules/${createRule['rule-id']}`,token);

}
return "No account-id is available";
}catch(error){
    console.log('Something went wrong ',error);
}
}

// Invoke the application by passing email-id and ICCID
alertMe('<<EMAIL_ID>>','<<ICCID>>');