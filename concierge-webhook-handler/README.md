# concierge-webhook-handler

## Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Usage](#usage)

## About <a name = "about"></a>

A Concierge Webhook Handler that displays details about people identified by Incode Concierge

## Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [deployment](#deployment) for notes on how to deploy the project on a live system.

First make a copy of .env_sample called .env and replace with the proper values.
```
cp .env_sample .env
```

Install dependencies using:

```
npm install
```

And run locally using:
```
npm run dev
```

### Prerequisites

A user account must be set in Incode's dashboard and configured on the .env file

## Usage <a name = "usage"></a>

Client address: https://SERVER_ADDRESS/index.html

Webhook to be registered: https://SERVER_ADDRESS/webook
