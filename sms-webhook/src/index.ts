import express from "express";
import compression from "compression";
import morgan from 'morgan';
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import "dotenv/config";

import { logger } from './helpers/logger';
import { IWebHookParams } from './interfaces';
import { SMSFlow } from './sms-flow';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("common"))
app.use(helmet());
app.use(cors())
app.use(compression());

const port = process.env.PORT || 3000;

//Enter a phone number to receive SMS (include '+' and country code)
const phoneNumbers = ['+16465555555'];

app.post("/hook", async (req, res) => {

    let webHookParams: IWebHookParams = {
        interviewId: req.body.interviewId,
        externalId: req.body.externalId,
        onboardingStatus: req.body.onboardingStatus,
        requestId: new Date().toISOString()
    }

    logger.warn("Incode WebHook Event Start", webHookParams);

    if (webHookParams?.onboardingStatus === "ONBOARDING_FINISHED" || webHookParams?.onboardingStatus === "EXPIRED") {
        try {
            const flow = new SMSFlow({ webhookParams: webHookParams, phoneNumber: phoneNumbers[0] });
            await flow.run();

        } catch (error) {
            logger.error("Incode WebHook Error", { msg: "SMSFlow failed to run." });
            res.status(500).json();
        }
    }

    res.status(200).json(null);

});

app.listen(port, () => { console.log(`Listening on port: ${port}`); });
