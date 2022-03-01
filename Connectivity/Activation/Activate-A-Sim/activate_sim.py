from distutils.log import error
import requests
import json
import time

# Global variables with values to be replaced for each customer
# Change values accordingly
auth_token_get_url = "https://api.korewireless.com/Api/api/token"
client_id="<<YOUR CLIENT_ID>>"
client_secret="<<YOUR CLIENT_SECRET>>"
api_gateway_key="<<YOUR API_KEY>>"
api_base_path = "https://api.korewireless.com/connectivity"

#API Parameters
accountid='cmp-pp-org-xxx'
iccid='999XXXX25010000XXXX'
activationprofileid="cmp-prov-ap-xxx"


# =======================================================================================
#                               Get Authentication Token
# ======================================================================================
def getauthtoken():
    try:
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
    except requests.exceptions.RequestException as err:
        print(err)

# =======================================================================================
#                               Get Scbscription id from iccid
# ======================================================================================
def getSubscriptionId(aceesstoken,accountid,iccid):
    try:
        headers = {
        'Content-Type': 'application/json',
        'Authorization': 'bearer ' + aceesstoken,
        'x-api-key': api_gateway_key
        }
        api_url = "{api_base_path}/v1/accounts/{accountid}/subscriptions?page-index=0&max-page-item=100&iccid={iccid}&show-state-history=false".format(api_base_path=api_base_path,accountid=accountid,iccid=iccid)
        payload={}
        subscriptionresponse = requests.request("GET", api_url, headers=headers)
        subscriptionresponseJson = json.loads(subscriptionresponse.text)
        if(subscriptionresponseJson["page-info-result"]["total-count"]>0):
            return subscriptionresponseJson["subscriptions"][0]["subscription-id"]
        else:
            return ""
    except requests.exceptions.RequestException as err:
        print(err)

def createProvisioningRequest(aceesstoken, accountid, subscriptionid, activationprofileid):
    try:
        headers = {
        'Content-Type': 'application/json',
        'Authorization': 'bearer ' + aceesstoken,
        'x-api-key': api_gateway_key
        }
    
        api_url = "{api_base_path}/v1/accounts/{accountid}/provisioning-requests".format(api_base_path=api_base_path,accountid=accountid)
        payload = json.dumps({
            "activate": {
                "subscriptions": [
                    {
                        "subscription-id": subscriptionid
                    }
                ],
                "activation-state": "active",
                "activation-profile-id": activationprofileid
            }
        })
        response = requests.request("POST", api_url, headers=headers, data=payload)
        return response.text
    except requests.exceptions.RequestException as err:
        print(err)

def checkProvisioningStatus(aceesstoken, accountid,provisioningrequestid):
    try:
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + aceesstoken,
            'x-api-key': api_gateway_key
        }
        api_url = "{api_base_path}/v1/accounts/{accountid}/provisioning-requests/{provisioningrequestid}".format(api_base_path=api_base_path,accountid=accountid,provisioningrequestid=provisioningrequestid)
        payload={}
        response = requests.request("GET", api_url, headers=headers, data=payload)
        return response.text
    except requests.exceptions.RequestException as err:
        print(err)

# =======================================================================================
#                               API Access Process
# ======================================================================================
# Get the API Token
accesstoken=getauthtoken()

#Get the Subscription id for the iccid
subscriptionid=getSubscriptionId(accesstoken,accountid,iccid)
#If we got a subscription id to proceed to the next step
if(len(subscriptionid)>0):
    # Provision a SIM
    # A success response will be something like this 
    # {"status": "success","data": {"provisioning-request-id": "cmp-cpro-request-1460","message": "Your request has been acknowledged"} }
    provisioningrequestresponse=createProvisioningRequest(accesstoken,accountid,subscriptionid,activationprofileid)
    print(provisioningrequestresponse)
    provisioningrequestJson = json.loads(provisioningrequestresponse)
    if(provisioningrequestJson["status"].casefold() =="success"):
        #Wait for the request to complete
        print('Deliberately waiting 1 minute for request to get completed')
        time.sleep(60) 
        #Check Provisioning status
        provisioningrequeststatusresponse=checkProvisioningStatus(accesstoken,accountid,provisioningrequestJson["data"]["provisioning-request-id"])
        print(provisioningrequeststatusresponse)
    else:
        print('Request Failed')
else:
    print('No Subscription id recieved for the iccid')
