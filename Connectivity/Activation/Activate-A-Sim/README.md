# Event/Rules Example - Activate a Sim

Connectivity APIs use case - Activate a Sim

### API Home Page

https://developer.korewireless.com/api?product=Connectivity#overview

<a name="Configuration options"></a>

## Options Supported (Required)

- CLIENT_ID - client id obtained when creating a new client
- CLIENT_SECRET - client secret corresponding to client
- API_KEY - api key corresponding to client
- CPRO_BASEURL - base URL can be configured according to Sandbox/Production environment
- TOKEN_URL - URL to obtain access_token (https://api.korewireless.com/Api/api/token)

## Prerequisites

1. Stable version of Node.js
2. Stable version of NPM( Node Package Manager)

Please refer to https://nodejs.org/en/download/ for more details

## Installation

Navigate to code directory and run the following command to install the necessary dependencies

1. Get client-id, client-secret and API Key from [https://developer.korewireless.com](https://developer.korewireless.com)
2. Clone the repo
   ```sh
   git clone https://github.com/korewireless/Developer-API.git
   ```
3. Install NPM packages
   ```sh
   cd Connectivity/Alerting/Alert-me-when-my-sims-go-active 000000000000000000000000
   npm install
   ```
4. Enter your credentials in `config.json`
   ```JSON
   CLIENT_ID:"<<YOUR CLIENT_ID>>"
   CLIENT_SECRET:"<<YOUR CLIENT_SECRET>>"
   API_KEY:"<<YOUR API_KEY>>"
   CPRO_BASEURL:"<<BASE_URL according to API SERVER>>"
   ```

#### CPRO_BASEURL Possible Values

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
What operation do you want to perform ? Please select 1 ,2 or 3
1.Create a new rule
2.List all rules
3.Modify a rule
```

Please enter your rule-id in the next step in case of Modify a Rule

```sh
Please enter your rule-id :
```

### Node Dependencies Used

The Node packages required for the project are:

1. axios (https://www.npmjs.com/package/axios)
2. prompt (https://www.npmjs.com/package/prompt)
3. csv-parser (https://www.npmjs.com/package/csv-parser)
4. colors (https://www.npmjs.com/package/colors)
5. fs (https://nodejs.org/api/fs.html)
6. util (https://nodejs.org/api/util.html)

Dependencies needed for Node projects are typically listed in a file called package.json

## API Work Flow

- Step 1: Obtain the access_token
- Step 2: Get the account-id (Assuming we'll grab the first account from the accounts list in case the user has parent/child)
- Step 3: Get the subscription-ids based on the ICCIDs from data.csv file placed in the root directory
