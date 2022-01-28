# Usage Example - Usage by Plan

Connectivity APIs use case - Usage by Plan

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

## Installation
Navigate to code directory and run the following command to install the necessary  dependencies

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
   python usage_by_plan.py
   ```
### Python Dependencies Used
The Python packages required for the project are:

1. requests (https://docs.python-requests.org/en/latest/)
2. json (https://docs.python.org/3/library/json.html)
3. time (https://docs.python.org/3/library/time.html)


## API Work Flow

- Step 1: Obtain the access_token
- Step 2: Get all eligible plans based on account-id

#### Sample response schema
```sh
{
  "plans": [
    {
      "plan": {
        "plan-name": "string",
        "plan-id": "string",
        "plan-type-id": "string",
        "usage-type": "DATA",
        "service-type-id": "string"
      }
    }
  ]
}
```
- Step 3: Get usage based on plan-id obtained from previous step
#### Supported query params
```json
1. start-date (mandatory) - format should be 'YYYY-MM-DD'
2. end-date (mandatory) - format should be 'YYYY-MM-DD'
   Date range must fall in between 60 days
3. source - allowed value is cdr

```

#### Sample response schema
```sh
{
  "source": "string",
  "plan-id": "string",
  "total-usage": 0,
  "unit": "string",
  "daily-usages": [
    {
      "date": "dateTime",
      "total-usage": 0,
      "unit": "string"
    }
  ]
}
```
