# Example Token Server Using NodeJS

There is one endpoint on this web server named `/startup`.  

The `/startup` endpoint will call Incode's `omni/start` API to create an Incode session which will include a token in the JSON response.  This token can be shared with Incode SDK client apps to do token based initialization, which is a best practice.  

## Prerequisites

This sample uses the global fetch API so you must use Node 18 or higher.

## Local Development

### Using NPM

```
npm run start
```

Will accept HTTP requests on `http://localhost:3000/startup`


### Using Docker

```
docker-compose build
docker-compose --env-file ./.env up
```

Will accept HTTP requests on `http://localhost:8080/startup`


## Environment Variables (Testing)

* `API_URL`: `https://demo-api.incodesmile.com`
* `API_KEY`: `abcdefg` (API Key from your delivery document)
* `API_VERSION`: `1.0` 
* `CLIENT_ID`: `your-client-id`
* `FLOW_ID`: Flow Id from your Incode dashboard.

## Dependencies

* **express**: Web server framework.
* **dotenv**: Used to access environment variables.
