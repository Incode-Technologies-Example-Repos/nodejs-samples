const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const https = require('https');

const app = express();
dotenv.config();

const defaultHeader = {
    'Content-Type': "application/json",
    'x-api-key': process.env.API_KEY,
    'api-version': '1.0'
}

app.use(cors())

app.get('/start', async (req, res) => {
  const startUrl = `${process.env.API_URL}/omni/start`;
  const startParams = {
    configurationId: process.env.FLOW_ID,
    countryCode: "ALL",
    language: "en-US"
  };
  const startData = await doPost(startUrl, startParams);
  
  res.json(startData);
});

app.get('/onboarding-url', async (req, res) => {
  // Enable the server to receive the url to redirect at the end of the flow
  const redirectUrl=req.query.redirectUrl||undefined;
  const startUrl = `${process.env.API_URL}/omni/start`;
  const startParams = {
    configurationId: process.env.FLOW_ID,
    countryCode: "ALL",
    language: "en-US",
    redirectUrl // Enable the server to receive the url to redirect at the end of the flow
  };

  const startData = await doPost(startUrl, startParams);
  
  const onboardingHeader = {
    'Content-Type': "application/json",
    'X-Incode-Hardware-Id': startData.token,
    'api-version': '1.0'
  };
  const onboardingUrl = `${process.env.API_URL}/0/omni/onboarding-url`;
  const onboardingParams = { clientId: process.env.CLIENT_ID }
  const onboardingUrlData = await doGet(onboardingUrl,onboardingParams, onboardingHeader);

  res.json({ ...startData, ...onboardingUrlData });
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
const httpPort = parseInt(process.env.HTTP_PORT) || 3000;
app.listen(httpPort, () => {
  console.log(`HTTP listening on: http://localhost:${httpPort}/`);
});

// Listen for HTTPS
const httpsPort = parseInt(process.env.HTTPS_PORT) || 3001;
https.createServer(
  {
    key: fs.readFileSync("./key.pem"),
    cert: fs.readFileSync("./cert.pem")
  },
  app
).listen(httpsPort, () => {
  console.log(`HTTPS listening on: https://localhost:${httpsPort}/`);
});

module.exports = app;
