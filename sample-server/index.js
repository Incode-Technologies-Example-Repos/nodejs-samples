const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');

const app = express();
dotenv.config();

app.use(cors())
// Middleware to handle raw body data
app.use(express.raw({ type: '*/*' }));

const defaultHeader = {
  'Content-Type': "application/json",
  'x-api-key': process.env.API_KEY,
  'api-version': '1.0'
};

// Call Incode's `omni/start` API to create an Incode session which will include a
// token in the JSON response.
app.get('/start', async (req, res) => {
  const startUrl = `${process.env.API_URL}/omni/start`;
  const startParams = {
    configurationId: process.env.FLOW_ID,
    countryCode: "ALL",
    language: "en-US"
  };
  const startData = await doPost(startUrl, startParams, defaultHeader);
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

  const startData = await doPost(startUrl, startParams, defaultHeader);
  
  const onboardingHeader = {
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
// incode dasboard > settings > webhook > onboarding status
app.post('/webhook', async (req, res) => {
    // Handle the received webhook data
    const webhookData = JSON.parse(req.body.toString());
  
    // Process received data (for demonstration, just returning the received payload
    // and include the timestamp)
    response = {
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      success: true,
      data: webhookData
    }
    res.status(200).send(response);

    // Write to a log so you can debug it.
    console.log(response);
});

// Webhook to receive onboarding status, configure it in
// incode dasboard > settings > webhook > onboarding status
// This endpoint will auto-approve(create an identity) for
// any sessions that PASS.
app.post('/approve', async (req, res) => {
  // Handle the received webhook data
  const webhookData = JSON.parse(req.body.toString());
  
  if(webhookData.onboardingStatus==="ONBOARDING_FINISHED"){
    // Admin Token + ApiKey are needed for approving and fetching scores
    const adminHeaders = {
      'Content-Type': "application/json",
      'x-api-key': process.env.API_KEY,
      'X-Incode-Hardware-Id': process.env.ADMIN_TOKEN,
      'api-version': '1.0'
    };

    const scoreUrl = `${process.env.API_URL}/omni/get/score`;
    const onboardingScore = await doGet(scoreUrl, {id:webhookData.interviewId}, adminHeaders);
    
    //Onboarding Score has a lot of information that might interest you https://docs.incode.com/docs/omni-api/api/onboarding#fetch-scores

    if (onboardingScore.overall.status==='OK'){
 
      const approveUrl = `${process.env.API_URL}/omni/process/approve?interviewId=${webhookData.interviewId}`;
      const identityData = await doPost(approveUrl,{}, adminHeaders);
     
      response = {
        timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
        success:true,
        data: identityData
      }
      // This would return something like this:
      // {
      //   timestamp: '2024-01-04 00:38:28',
      //   success: true,
      //   data: {
      //     success: true,
      //     uuid: '6595c84ce69d469f69ad39fb',
      //     token: 'eyJhbGciOiJ4UzI1NiJ9.eyJleHRlcm5hbFVzZXJJZCI6IjY1OTVjODRjZTY5ZDk2OWY2OWF33kMjlmYiIsInJvbGUiOiJBQ0NFU5MiLCJrZXlSZWYiOiI2MmZlNjQ3ZTJjODJlOTVhZDNhZTRjMzkiLCJleHAiOjE3MTIxOTExMDksImlhdCI6MTcwNDMyODcwOX0.fbhlcTQrp-h-spgxKU2J7wpEBN4I4iOYG5CBwuQKPLQ72',
      //     totalScore: 'OK',
      //     existingCustomer: false
      //   }
      // }
      // UUID: You can save the generated uuid of your user to link your user with our systems.
      // Token: Is long lived and could be used to do calls in the name of the user if needed.
      // Existing Customer: Will return true in case the user was already in the database, in such case we are returning the UUID of the already existing user.
      
      res.status(200).send(response);
      console.log(response);
    } else {
       response = {
         timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
         success: false,
         error: "Session didn't PASS, identity was not created"
       }
       res.status(200).send(response);
       console.log(response)
    }

  } else {
    // Process received data (for demonstration, just returning the received payload
    // and include the timestamp)
    response = {
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      success: true,
      data: JSON.parse(webhookData.toString())
    }
    res.status(200).send(response);

    // Write to a log so you can debug it.
    console.log(response);
  }
});

// Receives the information about a faceMatch attempt and verifies
// if it was correct and has not been tampered.
app.post('/auth', async (req, res) => {
  const faceMatchData = JSON.parse(req.body.toString());
  const {transactionId, token, interviewToken} = faceMatchData;
  const verifyAttemptUrl = `${process.env.API_URL}/omni/auth-attempt/verify`;
  
  const params = { transactionId, token, interviewToken };
  const verificationData = await doPost(verifyAttemptUrl, params, defaultHeader);

  log = {
    timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
    data: {...params,...verificationData}
  }
  res.status(200).send(verificationData);

  // Write to a log so you can debug it.
  console.log(log);
});



app.get('*', function(req, res){
  res.status(404).json({error: `Cannot GET ${req.url}`});
});

app.post('*', function(req, res){
  res.status(404).json({error: `Cannot POST ${req.url}`});
});

// Utility functions
const doPost = async (url, bodyparams, headers) => {
  try {
    const response = await fetch(url, { method: 'POST', body: JSON.stringify(bodyparams), headers});
    return response.json();
  } catch (e) {
    console.log(`Warning:  HTTPPOST error.`, e);
  }
}

const doGet = async (url, params, headers) => {
  headers = headers;
  console.log({url: `${url}?` + new URLSearchParams(params), headers})
  try {
    const response = await fetch(`${url}?` + new URLSearchParams(params), {method: 'GET', headers});
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
