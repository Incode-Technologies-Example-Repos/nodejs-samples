const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');

const app = express();
dotenv.config();

const defaultHeader = {
    'Accept': 'application/json',
    'Content-Type': "application/json",
    'x-api-key': process.env.API_KEY,
    'api-version': '1.0'
}

app.use(cors())
// Middleware to handle raw body data
app.use(express.raw({ type: '*/*' }));

// Call Incode's `omni/start` API to create an Incode session which will include a
// token in the JSON response.
app.get('/start', async (req, res) => {
  const startUrl = `${process.env.API_URL}/omni/start`;
  const startParams = {
    configurationId: process.env.FLOW_ID,
    countryCode: "ALL",
    language: "en-US"
  };
  const startData = await doPost(startUrl, startParams);
  const {token, interviewId} = startData;
  res.json({token, interviewId});
});

// Calls incodes `omni/start` and then with the token calls `0/omni/onboarding-url`
// to retrieve the unique onboarding-url for the newly created session.
app.get('/onboarding-url', async (req, res) => {
  const startUrl = `${process.env.API_URL}/omni/start`;
  const startParams = {
    configurationId: process.env.FLOW_ID,
    countryCode: "ALL",
    language: "en-US"
  };

  // Enable the server to receive the url to redirect at the end of the flow
  const redirectionUrl=req.query.redirectionUrl||undefined;
  if(redirectionUrl !=='') { 
    startParams.redirectionUrl = redirectionUrl
  }

  const startData = await doPost(startUrl, startParams);
  
  const onboardingHeader = {
    'Accept': 'application/json',
    'Content-Type': "application/json",
    'X-Incode-Hardware-Id': startData.token,
    'api-version': '1.0'
  };
  const onboardingUrl = `${process.env.API_URL}/0/omni/onboarding-url`;
  const onboardingParams = { clientId: process.env.CLIENT_ID }
  const onboardingUrlData = await doGet(onboardingUrl,onboardingParams, onboardingHeader);
  
  session ={ token: startData.token, interviewId: startData.interviewId, url: onboardingUrlData.url }
  res.json(session);
});

// Webhook to receive onboarding status, configure it in
// incode dasboard >settings > webhook >onboarding status
app.post('/webhook', async (req, res) => {
    // Handle the received webhook data
    const webhookData = req.body;
  
    // Process received data (for demonstration, just returning the received payload
    // and include the timestamp)
    response = {
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      data: JSON.parse(webhookData.toString())
    }
    res.status(200).send(response);

    // Write to a log so you can debug it.
    console.log(response);
});

app.get('*', function(req, res){
  res.status(404).json({error: `Cannot GET ${req.url}`});
});

app.post('*', function(req, res){
  res.status(404).json({error: `Cannot POST ${req.url}`});
});

// Utility functions
const doPost = async (url, params, header) => {
  header = header||defaultHeader;
  try {
    const response = await fetch(url, { method: 'POST', body: JSON.stringify(params), headers: header });
    return response.json();
  } catch (e) {
    console.log(`Warning:  HTTPPOST error.`, e);
  }
}

const doGet = async (url, params, header) => {
  header = header||defaultHeader;
  try {
    const response = await fetch(`${url}?` + new URLSearchParams(params), { headers: header });
    return response.json();
  } catch (e) {
    console.log(`Warning:  HTTPGET error.`, e);
  }
}

// Listen for HTTP
const httpPort = 3000;
app.listen(httpPort, () => {
  console.log(`HTTP listening on: http://localhost:${httpPort}/`);
});

module.exports = app;
