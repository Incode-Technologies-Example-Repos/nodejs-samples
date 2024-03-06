const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

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

// Admin Token + ApiKey are needed for approving and fetching scores
const adminHeaders = {
  'Content-Type': "application/json",
  'x-api-key': process.env.API_KEY,
  'X-Incode-Hardware-Id': process.env.ADMIN_TOKEN,
  'api-version': '1.0'
};

// Call Incode's `omni/start` API to create an Incode session which will include a
// token in the JSON response.
app.get('/start', async (req, res) => {
  const startUrl = `${process.env.API_URL}/omni/start`;
  const startParams = {
    configurationId: process.env.FLOW_ID,
    countryCode: "ALL",
    language: "en-US",
    // redirectionUrl: "https://example.com?custom_parameter=some+value",
    // externalCustomerId: "the id of the customer in your system",
  };
  try{
    const startData = await doPost(startUrl, startParams, defaultHeader);
    const {token, interviewId} = startData;
    res.json({token, interviewId});
  } catch(e) {
    console.log(e.message);
    res.status(500).send({success:false, error: e.message});
    return;
  }
});

// Calls incodes `omni/start` and then with the token calls `0/omni/onboarding-url`
// to retrieve the unique onboarding-url for the newly created session.
app.get('/onboarding-url', async (req, res) => {
  const startUrl = `${process.env.API_URL}/omni/start`;
  const startParams = {
    configurationId: process.env.FLOW_ID,
    countryCode: "ALL",
    language: "en-US",
    // redirectionUrl: "https://example.com?custom_parameter=some+value",
    // externalCustomerId: "the id of the customer in your system",
  };
  
  let startData = null;
  try{
    startData = await doPost(startUrl, startParams, defaultHeader);
  } catch(e) {
    console.log(e.message);
    res.status(500).send({success:false, error: e.message});
    return;
  }
  const {token, interviewId} = startData;
  
  const onboardingHeader = {
    'Content-Type': "application/json",
    'X-Incode-Hardware-Id': startData.token,
    'x-api-key': process.env.API_KEY,
    'api-version': '1.0'
  };
  const onboardingUrl = `${process.env.API_URL}/0/omni/onboarding-url`;
  
  let onboardingUrlData= null;
  try{
    onboardingUrlData = await doGet(onboardingUrl, {}, onboardingHeader);
  } catch(e) {
    console.log(e.message);
    res.status(500).send({success:false, error: e.message});
    return;
  }
  session ={ success:true, token, interviewId, url: onboardingUrlData.url }
  res.json(session);
});



// Checks if an onboarding has been finished against a local method of Storage
app.get('/onboarding-status', async (req, res) => {
  // Get the interviewId from query parameters
  const interviewId = req.query.interviewId;
  if (!interviewId) {
    res.status(400).send({success:false, error:'Missing required parameter interviewId'});
    return;
  } 
  
  const statusURL = `${process.env.API_URL}/omni/get/onboarding/status`;
  try {
    const response = await doGet(statusURL, {id:interviewId}, adminHeaders);
    onboardingStatus = response.onboardingStatus;
    res.status(200).send({success:true, onboardingStatus})
  } catch(e) {
    console.log(e.message);
    res.status(500).send({success:false, error: e.message});
  }
});

// Checks if an onboarding has been finished against a local method of Storage
app.get('/fetch-score', async (req, res) => {
  // Get the interviewId from query parameters
  const interviewId = req.query.interviewId;
  if (!interviewId) {
    res.status(400).send({success:false, error:'Missing required parameter interviewId'});
    return;
  }
  
  //Let's find out the score
  const scoreUrl = `${process.env.API_URL}/omni/get/score`;
  let onboardingScore = null
  try {
    onboardingScore = await doGet(scoreUrl, {id:interviewId}, adminHeaders);
  } catch(e) {
    console.log(e.message);
    res.status(500).send({success:false, error: e.message});
    return;
  }
  
  // Onboarding Score has a lot of information that might interest you
  // https://docs.incode.com/docs/omni-api/api/onboarding#fetch-scores
  if (onboardingScore?.overall?.status==='OK'){
    // Session passed with OK here you would procced to save user data into
    // your database or any other process your bussiness logic requires.
    console.log('User passed with OK');
    res.json({success:true, score: 'OK'});
  } else {
    console.log("User didn't passed");
    res.json({success:true, score: 'FAIL'});
  }
  
});

// Webhook to receive onboarding status, configure it in
// incode dasboard > settings > webhook > onboarding status
app.post('/webhook', async (req, res) => {
  // Handle the received webhook data
  const webhookData = JSON.parse(req.body.toString());
  
  // Last Step of the onboarding, now you can ask for the score.
  if(webhookData.onboardingStatus==="ONBOARDING_FINISHED"){
    
    console.log('User finished onboarding');
    
    
    const scoreUrl = `${process.env.API_URL}/omni/get/score`;
    let onboardingScore = {}
    try {
      onboardingScore = await doGet(scoreUrl, {id:webhookData.interviewId}, adminHeaders);
    } catch(e) {
      console.log(e.message);
    }
    // Onboarding Score has a lot of information that might interest you
    // https://docs.incode.com/docs/omni-api/api/onboarding#fetch-scores
    if (onboardingScore?.overall?.status==='OK'){
      // Session passed with OK here you would procced to save user data into
      // your database or any other process your bussiness logic requires.
      console.log('User passed with OK');
    } else {
      console.log('User did not passed');
    }
  }
  
  
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
      //'x-api-key': process.env.API_KEY,
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
    if (!response.ok) {
      throw new Error('Request failed with code ' + response.status)
    }
    return response.json();
  } catch(e) {
    throw new Error('HTTP Post Error: ' + e.message)
  }
}

const doGet = async (url, params, headers) => {
  try {
    const response = await fetch(`${url}?` + new URLSearchParams(params), {method: 'GET', headers});
    if (!response.ok) {
      throw new Error('Request failed with code ' + response.status)
    }
    return response.json();
  } catch(e) {
    throw new Error('HTTP Get Error: ' + e.message)
  }
}

// Listen for HTTP
const httpPort = 3000;

app.listen(httpPort, () => {
  console.log(`HTTP listening on: http://localhost:${httpPort}/`);
});

module.exports = app;
