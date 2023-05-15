const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const app = express();
dotenv.config();

app.use(cors())

const doPost = async (url, params, header) => {
  if (!header) {
    header = {
      'Content-Type': "application/json",
      'x-api-key': process.env.API_KEY,
      'api-version': '1.0'
    };
  }

  try {
    const response = await fetch(url, { method: 'POST', body: JSON.stringify(params), headers: header });
    return response.json();
  } catch (e) {
    console.log(`Attention:  HTTPPOST error.`, e);
  }
}

const doGet = async (url, params, header) => {
  if (!header) {
    header = {
      'Content-Type': "application/json",
      'X-Incode-Hardware-Id': process.env.API_KEY,
      'api-version': '1.0'
    };
  }

  try {
    const response = await fetch(`${url}?` + new URLSearchParams(params), { headers: header });
    return response.json();
  } catch (e) {
    console.log(`Attention:  HTTPGET error.`, e);
  }
}

app.get('/startup', async (req, res) => {
  const startUrl = `${process.env.API_URL}/omni/start`;
  const startParams = {
    configurationId: process.env.FLOW_ID,
    countryCode: "ALL",
    language: "en-US"
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

const httpPort = parseInt(process.env.HTTP_PORT) || 3000;

app.listen(httpPort, () => {
  console.log(`HTTP listening on port ${httpPort}`);
});

module.exports = app;