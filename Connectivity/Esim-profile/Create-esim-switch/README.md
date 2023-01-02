# ESIM Profile Switch Example - Create an ESIM Switch

Connectivity APIs use case - ESim Profile Switch

### API Home Page
 https://developer.korewireless.com/api?product=Connectivity#overview

<a name="Configuration options"></a>

## Options Supported (Required)
- CLIENT_ID      - client id obtained when creating a new client
- CLIENT_SECRET  - client secret corresponding to client 
- API_KEY        - api key corresponding to client
- Connectivity_BASEURL   - base URL can be configured according to Sandbox/Production environment
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
   cd Connectivity/Esim-profile/Create-esim-switch
   npm install
   ```
4. Enter your credentials in `config.json`
   ```JSON
   CLIENT_ID:"<<YOUR CLIENT_ID>>"
   CLIENT_SECRET:"<<YOUR CLIENT_SECRET>>"
   API_KEY:"<<YOUR API_KEY>>"
   Connectivity_BASEURL:"<<BASE_URL according to API SERVER>>"
   ```
#### Connectivity_BASEURL Possible Values
```sh
https://api.korewireless.com/connectivity - Production
https://sandbox.api.korewireless.com/connectivity - Sandbox
```

After Successful installation of dependencies run the following command to start off the application
   ```sh
   npm start
   ```
Please choose the appropriate operation from the prompt
```sh
Welcome to Esim Switch Management Console 
Please select your desired option 1 or 2 ? 
1.Switch a VZW Profile
2.Switch non VZW Profile
```
If the choice is 1 please enter your IMEI also
```sh
Please enter your IMEI :
```
Please enter your EIDs you wish to switch in a comma separated format
```sh
Please enter your desired EIDs in a comma separated format  :
```
And last please enter your Activation Profile Id
```sh
Please enter your activation-profile-id :
```

## API Work Flow

- Step 1: Obtain the access_token
- Step 2: Get the account-id (Assuming  we'll grab the first account from the accounts list  in case the user has parent/child)
- Step 3: Choose the type (V2W profile or non-V2w)
- Step 4: If the V2W is selected then enter the IMEI
- Step 5: Enter the desired EIDs in a comma separated format
- Step 6: Enter the activation-profile-id
- Step 7: Based on the information provided perform the profile switch operation 


#### Sample Request Body:
 ```JSON
{
  "activation-profile-id": "cmp-pp-ap-000000",
  "subscriptions": [
    {
      "eid": "0000000000000000000000000",
      "imei": "12121212121212"
    }
  ]
}
```
- Step 8: Wait for the switch process to complete

#### Sample Result after a successful ESIM Switch
```JSON
{
  "esim-profile-switch-request-id": "cmp-cpro-request-00000",
  "activation-profile-id": "cmp-cpro-request-00000",
  "switch-request-date": "2022-11-16T07:43:02.428Z",
  "switch-request-status": "Completed",
  "total-switch-processing": 0,
  "total-switch-failed": 0,
  "total-switch-completed": 0,
  "total-switch-pending-network-connection": 0,
  "total-switch-requested": 0,
  "eids": [
    {
      "eid": "000000000000000000000000000",
      "new-subscription-id": "cmp-k1-subscription-0000000000",
      "old-subscription-id": "cmp-k1-subscription-0000000000",
      "switch-status": "Completed",
      "switch-error-message": "Error Message"
    }
  ]
}
```
### Node Dependencies Used
The Node packages required for the project are:

1. axios (https://www.npmjs.com/package/axios)
2. prompt (https://www.npmjs.com/package/prompt)
3. colors (https://www.npmjs.com/package/colors)

Dependencies needed for Node projects are typically listed in a file called package.json
