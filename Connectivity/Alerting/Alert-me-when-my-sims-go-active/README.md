# Event/Rules Example - Alert me when my sims go active

Connectivity APIs use case - Alert me when my sims go active

### API Home Page
 https://developer.korewireless.com/api?product=Connectivity#overview

<a name="Configuration options"></a>

## Options supported (Required)
- CLIENT_ID      - client id obtained when creating a new client
- CLIENT_SECRET  - client secret corresponding to client 
- API_KEY        - api key corresponding to client
- CPRO_BASEURL   - base URL can be configured according to Sandbox/Production environment
- TOKEN_URL      - URL to obtain access_token (https://api.korewireless.com/Api/api/token)


## Prerequisites

1. Stable version of Node.js
2. Stable version of NPM( Node Package Manager)

Please refer to https://nodejs.org/en/download/ for more details

## Installation
Navigate to code directory and run the following command to install the necessary  dependencies

1. Get client-id, client-secret and API Key from [https://developer.korewireless.com](https://developer.korewireless.com)
2. Clone the repo
   ```sh
   git clone https://github.com/korewireless/Developer-API.git
   ```
3. Install NPM packages
   ```sh
   cd Connectivity/Alerting/Alert-me-when-my-sims-go-active 
   npm install
   ```
4. Enter your credentials in `config.json`
   ```JSON
   CLIENT_ID:"<<YOUR CLIENT_ID>>"
   CLIENT_SECRET:"<<YOUR CLIENT_SECRET>>"
   API_KEY:"<<YOUR API_KEY>>"
   CPRO_BASEURL:"<<BASE_URL according to API SERVER"
   ```
#### CPRO_BASEURL Possible Values
```sh
https://api.korewireless.com/connectivity - Production
https://sandbox.api.korewireless.com/connectivity - Sandbox
```

After Successful installation of dependencies run the following command to start off the application
   ```sh
   node index.js
   ```

### Node Dependencies Used
The Node packages required for the project are:

1. Axios (https://www.npmjs.com/package/axios)

Dependencies needed for Node projects are typically listed in a file called package.json


## API Work flow

- Step 1: Obtain the access_token
- Step 2: Get the account-id
- Step 3: Get the subscription-id based on the ICCID
- Step 4: Build a rule for ready to active
#### Sample Event:
 ```JSON
{
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
                "attribute-value": "cmp-XX-subscription-250XXXX" // Replace with your desired subscription id if required
            },
        ],
        "actions": {
            "webhook": {
                "webhook-url": "https://my-listener.com/listen" // Replace with your cloud listener URL 
            }
        }
    }
```
- Step 5: Listen to the notifications by leveraging a cloud listener (eg: https://requestcatcher.com/)

#### Sample alert
```JSON
{
    "alert-id": 17,
    "alert-message-date": "2021-09-28T10:09:25Z",
    "rule-id": 18,
    "rule-name": "Stock to Active State Change Rule",
    "event-name": "connectivity.subscription.state.changed",
    "account": "cmp-pp-org-310",
    "events": [
        {
            "id": "6a4ad3f3-b398-xxxx-1da9-xxxxxx457cfd",
            "data": {
                "subscription-id": "cmp-XX-subscription-250XXXXX",
                "new-state": "Active",
                "old-state": "Stock",
                "exact-date-time": "2021-09-28T10:09:24.384Z"
            }
        }
    ]
}
```
- Step 6: Modify a rule and update the list of SIMS to be alerted off
#### Sample Event:
```JSON
{
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
            }, // added more subscription ids 
        ],
        "actions": {
            "webhook": {
                "webhook-url": "https://my-listener.com/listen"
            }
        }
    }
   ```

