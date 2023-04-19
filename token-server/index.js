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
    response = await fetch(url, { method: 'POST', body: JSON.stringify(params), headers: header });
    return response.json();
  } catch (e) {
    console.log(`Attention:  HTTPPOST error.`, e);
  }
}

app.get('/startup', async (req, res) => {
  const startUrl = `${process.env.API_URL}/omni/start`;
  const params = {
    configurationId: process.env.FLOW_ID,
    countryCode: "ALL",
    language: "en-US"
  };
  const { token } = await doPost(startUrl, params);
  res.json({ token: token });
});

const httpPort = parseInt(process.env.HTTP_PORT) || 3000;

app.listen(httpPort, () => {
  console.log(`HTTP listening on port ${httpPort}`);
});

module.exports = app;