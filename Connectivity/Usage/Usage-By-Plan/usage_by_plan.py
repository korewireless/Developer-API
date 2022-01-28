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
#                               Get All Eligible Plans for the account
# =======================================================================================
def getEligiblePLans(aceesstoken,accountid):
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'bearer ' + aceesstoken,
        'x-api-key': api_gateway_key
    }
    api_url = "{api_base_path}/v1/accounts/{accountid}/plans".format(api_base_path=api_base_path,accountid=accountid)
    payload={}
    planlistResponse = requests.request("GET", api_url, headers=headers)
    if(planlistResponse.status_code==200):
        return json.loads(planlistResponse.text)
    else:
        raise Exception("HTTP Exception {statuscode}: message{message}".format(planlistResponse.status_code,planlistResponse.raise_for_status()))

# =======================================================================================
#                               Get Usage by PlanId
# =======================================================================================
def getUsageByPlanId(aceesstoken,planid):
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'bearer ' + aceesstoken,
        'x-api-key': api_gateway_key
    }
    planResponse = ""
    api_url = "{api_base_path}/v1/accounts/{accountid}/plans/{planid}/usage-records?start-date={startdate}&end-date={enddate}&source=cdr".format(api_base_path=api_base_path,accountid=accountid,planid=planid,startdate=startdate,enddate=enddate)
    payload = {}
    planResponse = requests.request("GET", api_url, headers=headers, data=payload)

    if(planResponse.status_code==200):
        if(len(planResponse.text)>0):
            planResponseJson=json.loads(planResponse.text)
            print("Plan Id = {planid} & Usage = {usage}".format(planid=planid,usage=planResponseJson["total-usage"]))
        else:
            print("No response for {planid},{planResponse}".format(planid=planid,planResponse=planResponse.text))
    else:
        raise Exception("HTTP Exception {statuscode}: message{message}".format(planResponse.status_code,planResponse.raise_for_status()))   


# =======================================================================================
#                               API Access Process
# This will get all the eligible plans of an account and get the usages of each planid
# between the specified date
# ======================================================================================
try:
    # Get the API Token
    accesstoken=getauthtoken()
    #Get the all eligible Plan Ids
    eligiblePLansJson=getEligiblePLans(accesstoken,accountid)
    SleepCount=0
    if(len(eligiblePLansJson["plans"])>0):
    #Loop through each eligible Planid and see the usage for each plan Id    
        for plan in eligiblePLansJson["plans"]:
            getUsageByPlanId(accesstoken,plan["plan"]["plan-id"])
            SleepCount=SleepCount+1
            #Added a sleep so that server will not reject continues request assuming this as a DOS attack
            if(SleepCount>10):
                SleepCount=0
                time.sleep(5)
    else:
        print('No eligible Plans ids recieved')
except Exception as err:
    print(err)       