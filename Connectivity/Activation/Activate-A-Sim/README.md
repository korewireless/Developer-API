# Provisioning Example - Activate my sim

Connectivity APIs use case - Activate my sim

### API Home Page
 https://developer.korewireless.com/api?product=Connectivity#overview

<a name="Configuration options"></a>

## Options Supported (Required)
- client_id      - client id obtained when creating a new client
- client_secret  - client secret corresponding to client 
- api_gateway_key  - api key corresponding to client
- api_base_path   - base URL can be configured according to Sandbox/Production environment
- auth_token_get_url      - URL to obtain access_token (https://api.korewireless.com/Api/api/token)


## Prerequisites

1. Stable version of Python
2. Stable version of pip( Python Package Manager)

Please refer to https://www.python.org/ for more details

## Configuration

1. Get client-id, client-secret and API Key from [https://developer.korewireless.com](https://developer.korewireless.com)
2. Clone the repo
   ```sh
   git clone https://github.com/korewireless/Developer-API.git
   ```
3. Replace your credentials in corresponding fields
   ```JSON
   client_id:"<<YOUR CLIENT_ID>>"
   client_secret:"<<YOUR CLIENT_SECRET>>"
   api_gateway_key:"<<YOUR API_KEY>>"
   api_base_path:"<<BASE_URL according to API SERVER>>"
   auth_token_get_url:"<<AUTH_URL according to API Environment>>"
   ```
#### api_base_path Possible Values
```sh
https://api.korewireless.com/connectivity - Production
https://sandbox.api.korewireless.com/connectivity - Sandbox
```

After Successful replacement of credentials navigate to root folder and run the following command to start off the application
   ```sh
   python activate_sim.py
   ```
### Python Dependencies Used
The Python packages required for the project are:

1. distutils (https://docs.python.org/3/library/distutils.html)
2. requests (https://docs.python-requests.org/en/latest/)
3. json (https://docs.python.org/3/library/json.html)
4. time (https://docs.python.org/3/library/time.html)


## API Work Flow

- Step 1: Obtain the access_token
- Step 2: Get subscription-id based on account-id and iccid
- Step 3: Create a provisioning request using the subscription-id obtained in the previous call along with desired request body

#### Sample request body schema
```sh
{
    "activate": {
        "subscriptions": [
            {
                "subscription-id": "string",
                "imei": "string"
            }
        ],
        "activation-state": "active",
        "activation-profile-id": "string",
        "sku": "string"
    }
}
```

#### Sample response schema
```sh
{
    "status": "string",
    "data": {
        "provisioning-request-id": "string",
        "message": "string"
    }
}
```
- Step 4: Check for the provisioning request status by using the provisioning-request-id obtained from the create provisioning request call
#### Response schema
 ```JSON
{
    "request-type": {
        "subscriptions": [
            {
                "subscription-id": "string",
                "completion-status": "string"
            }
        ],
        "status": "submitted",
        "activation-profile-id": "string"
    }
}
```
