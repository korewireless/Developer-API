# Usage Example - Usage by Subscription

Connectivity APIs use case - Usage by Subscription

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
   python usage_by_subscription.py
   ```
### Python Dependencies Used
The Python packages required for the project are:

1. requests (https://docs.python-requests.org/en/latest/)
2. json (https://docs.python.org/3/library/json.html)
3. time (https://docs.python.org/3/library/time.html)


## API Work Flow

- Step 1: Obtain the access_token
- Step 2: Get all subscriptions based on account-id
#### Supported query params
```json
1. page-index (mandatory) - can accept values from 0
2. max-page-item (mandatory) - how many items per page in the response up to a maximum of 100
3. sort-field - allowed values are subscription-id, iccid,service-type-id, cost-center-id.
   These values are case-sensitive, if not specified, will be sorted based on created time.
4. sort-direction - allowed values are Asc, Desc
   Default: Desc
   The value is case-sensitive
5. imsi
6. iccid
7. eid
8. sim-state
9. msisdn
10. show-state-history- allowed values are true, false
    Default - false
```

#### Sample response
```sh
{
    "page-info-result": {
        "total-count": 1,
        "page-index": 0,
        "max-page-item": 10
    },
    "subscriptions": [
        {
            "subscription-id": "cmp-pp-subscription-4499",
            "iccid": "89014912534567811499",
            "eid": "",
            "rsp-state": "",
            "product-offer-type": "",
            "imei": "",
            "imsi": "911234567811385",
            "msisdns": [
                {
                    "msisdn": "1963847085"
                }
            ],
            "service-type-id": "29",
            "states": [
                {
                    "state": "stock",
                    "state-id": "cmp-pp-state-Active",
                    "start-datetime-utc": "2019-05-14T00:00:00.000Z",
                    "end-datetime-utc": "",
                    "is-current": true
                }
            ],
            "cost-center-id": "1",
            "profiles": [
                {
                    "profile-id": "2",
                    "start-datetime-utc": "2019-05-14T00:00:00.000Z",
                    "end-datetime-utc": "",
                    "is-current": true
                }
            ],
            "apn-data": [
                {
                    "ip-address": "127.0.0.1"
                }
            ],
            "additional-fields": [
                {
                    "key": "SECTOR OF BUSINESS",
                    "value": "string"
                }
            ]
        }
    ]
}
```
- Step 3: Get usage based on subscription-id obtained from previous step
#### Supported query params
```json
1. start-date (mandatory) - format should be 'YYYY-MM-DD'
2. end-date (mandatory) - format should be 'YYYY-MM-DD'
   Date range must fall in between 60 days
3. source - allowed value is cdr

```

#### Sample response
```sh
{
    "source": "cdr",
    "subscription-id": "cmp-pp-subscription-4499",
    "voice": {
        "unit": "sec",
        "total-usage": 0,
        "daily-usages": [
            {
                "date": "2022-01-01T00:00:00",
                "unit": "sec",
                "total-usage": 0
            }
        ]
    },
    "data": {
        "unit": "byte",
        "total-usage": 0,
        "daily-usages": [
            {
                "date": "2022-01-01T00:00:00",
                "unit": "byte",
                "total-usage": 0
            }
        ]
    },
    "sms": {
        "unit": "event",
        "total-usage": 0,
        "daily-usages": [
            {
                "date": "2022-01-01T00:00:00",
                "unit": "event",
                "total-usage": 0
            }
        ]
    }
}
```
