from threading import Timer
import requests
import json
import time

# Global variables with values to be replaced for each customer
# Change values accordingly
auth_token_get_url = "https://api.korewireless.com/Api/api/token"
client_id:"<<YOUR CLIENT_ID>>"
client_secret:"<<YOUR CLIENT_SECRET>>"
api_gateway_key:"<<YOUR API_KEY>>"
api_base_path = "https://api.korewireless.com/connectivity"

#API Parameters
accountid='cmp-pp-org-XXX'
startdate="YYYY-MM-DD"
enddate="YYYY-MM-DD"

# =======================================================================================
#                               Get Authentication Token
# =======================================================================================
def getauthtoken():
    headers = {
        'cache-control': 'no-cache',
        'content-type': 'application/x-www-form-urlencoded',
    }
    # Set the required body values for getting Authentication token
    data = {
        'grant_type': 'client_credentials',
        'client_id': client_id,
        'client_secret': client_secret
    }
    # Raise the request for getting the Authentication token
    response = requests.post(auth_token_get_url, headers=headers, data=data)
    # Convert the response string to Json object so that token value can be extracted
    responseJson = json.loads(response.content)
    return responseJson["access_token"]

# =======================================================================================
#                               Get Subscription id of the accounts
# ======================================================================================
def getSubscriptions(aceesstoken,accountid,pageindex):
    headers = {
    'Content-Type': 'application/json',
    'Authorization': 'bearer ' + aceesstoken,
    'x-api-key': api_gateway_key
    }
    api_url = "{api_base_path}/v1/accounts/{accountid}/subscriptions?page-index={pageindex}&max-page-item=100&show-state-history=false".format(api_base_path=api_base_path,accountid=accountid,pageindex=pageindex)
    payload={}
    subscriptionresponse = requests.request("GET", api_url, headers=headers)
    return json.loads(subscriptionresponse.text)

# =======================================================================================
#                               Get Usage by Subscription Id
# =======================================================================================
def getUsageBySubscriptionId(aceesstoken,subscriptionid,itemindex):
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'bearer ' + aceesstoken,
        'x-api-key': api_gateway_key
    }
    usageResponse = ""
    try:
        api_url = "{api_base_path}/v1/accounts/{accountid}/subscriptions/{subscriptionid}/usage-records?start-date={startdate}&end-date={enddate}&source=cdr".format(api_base_path=api_base_path,accountid=accountid,subscriptionid=subscriptionid,startdate=startdate,enddate=enddate)
        payload = {}
        usageResponse = requests.request("GET", api_url, headers=headers, data=payload)
        if(len(usageResponse.text)>0):
            usageResponseJson=json.loads(usageResponse.text)
            print("{itemindex}: Subscription id = {subscriptionid} -  Voice = {voice}, Data= {data}, SMS={SMS}".format(itemindex=itemindex,subscriptionid=subscriptionid,voice=usageResponseJson["voice"]["total-usage"],data=usageResponseJson["data"]["total-usage"],SMS=usageResponseJson["sms"]["total-usage"]))
        else:
            print("{itemindex}: No response for {subscriptionid},{planResponse}".format(itemindex=itemindex,subscriptionid=subscriptionid,planResponse=usageResponse.text))
    except:
        print("{itemindex}: An exception occurred for {subscriptionid},{planResponse}".format(itemindex=itemindex,subscriptionid=subscriptionid,planResponse=usageResponse.text))
    


# =======================================================================================
#                               API Access Process
# This will get first 100 active scuscription and  get the usages of each subscriptionid
# between the specified date
# =======================================================================================
Itemcounter=0
ActiveSubscription=0
SleepCount=0
pageindex=0
itemindex=0
try:
    # Get the API Token
    accesstoken=getauthtoken()
    #Get the all Subscription Ids (Considering Pagination of 100 items)
    while True:
        subscriptionresponseJson=getSubscriptions(accesstoken,accountid,pageindex)
        Itemcounter=Itemcounter+len(subscriptionresponseJson["subscriptions"])
        TotalSubscription=subscriptionresponseJson["page-info-result"]["total-count"]
        for subscription in subscriptionresponseJson["subscriptions"]:
            itemindex=itemindex+1
            #This check will prevent getting more than 100 item in the Sample. This can be removed in real scenario
            if(ActiveSubscription<100):
                subscriptionid=subscription["subscription-id"]
                if(subscription["states"][0]["state"].casefold()=="active"):
                    ActiveSubscription=ActiveSubscription+1
                    SleepCount=SleepCount+1
                    getUsageBySubscriptionId(accesstoken,subscriptionid,itemindex)
                    if(SleepCount>10):
                        SleepCount=0
                        time.sleep(5)
                else:
                    print("{itemindex}: {subscriptionid} not active".format(itemindex=itemindex,subscriptionid=subscriptionid))    
            else:
                break
        if(Itemcounter<TotalSubscription and ActiveSubscription<100):
            pageindex=pageindex+1
        else:
            break
except Exception as err:
    print(err)    
