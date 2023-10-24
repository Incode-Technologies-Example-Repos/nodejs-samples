# Example Token Server Using NodeJS

## Endpoints

- `/start`: Call Incode's `omni/start` API to create an Incode session which will include a token in the JSON response.  This token can be shared with Incode SDK client apps to do token based initialization, which is a best practice.

- `/onboarding-url`: Calls incodes `omni/start` and then with the token calls `0/omni/onboarding-url` to retrieve the unique onboarding-url for the newly created session.

## Prerequisites

This sample uses the global fetch API so you must use Node 18 or higher.

## Local Development

### Environment

Rename `sample.env` file to `.env` adding your subscription information:

```env
API_URL=https://demo-api.incodesmile.com
API_KEY=abcdefg #API Key from your delivery document
API_VERSION=1.0 
CLIENT_ID=your-client-id
FLOW_ID=Flow Id from your Incode dashboard.
``````

### Using NPM

```bash
npm install
npm start
```

Will accept petitions on `http://localhost:3000/` and `https://localhost:3001/`

### Using Docker

```bash
docker-compose build
docker-compose --env-file ./.env up
```

Will accept petitions on `http://localhost:3000/` and `https://localhost:3001/`

## Dependencies

* **express**: Web server framework.
* **dotenv**: Used to access environment variables.
