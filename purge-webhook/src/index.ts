import express from "express";
import compression from "compression";
import morgan from 'morgan';
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import "dotenv/config";

import { IWebHookParams } from './interfaces';
import { logger } from './helpers/logger';
import { Auth } from './helpers/auth';
import { deleteSessions } from "./api/delete-multiple-sessions";
import { stringDate } from "./helpers/string-date";


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("common"))
app.use(helmet());
app.use(cors())
app.use(compression());


const port = process.env.PORT || 3000;

const initEnvironment = () => {
    const apiUrl = process.env.API_URL as string;
    const apiClientId = process.env.API_CLIENT_ID as string;
    const apiKey = process.env.API_KEY as string;
    const apiUser = process.env.API_USER as string;
    const apiPass = process.env.API_PASS as string;

    return {
        apiUrl: apiUrl,
        apiClientId: apiClientId,
        apiKey: apiKey,
        apiUser: apiUser,
        apiPass: apiPass,
        requestId: Date.now().toString()
    }
}


app.use( express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }) );


app.post("/hook", async (req, res) => {

    const webHookParams: IWebHookParams = {
        interviewId: req.body.interviewId,
        externalId: req.body.externalId,
        onboardingStatus: req.body.onboardingStatus,
        time: new Date().valueOf()
    } as IWebHookParams;

    logger.info("payload", { "notification": webHookParams, "stamp": stringDate(true) });

    if (webHookParams?.onboardingStatus === "ONBOARDING_FINISHED") {

        try {
            await purge(webHookParams);
            res.status(200).json(null);
        } catch (error) {
            res.status(500).json();
            logger.error("error", { "status": "Failed to delete completed session" });
        }

    } else if (webHookParams?.onboardingStatus === "EXPIRED") {
        try {
            await purge(webHookParams);
            res.status(200).json(null);
        } catch (error) {
            res.status(500).json();
            logger.error("error", { "status": "Failed to delete expired session" });
        }

    } else {
        res.status(200).json(null);
    }
})

app.listen(port, () => { console.log(`Listening on port: ${port}`); });

async function purge(webHookParams: IWebHookParams) {
    const client = initEnvironment();
    const auth = new Auth(client);
    const header = await auth.getLoginHeader();
    const deleteResult = await deleteSessions(client, header, webHookParams.interviewId);
    deleteResult.body.interviewId = webHookParams.interviewId;
    logger.info("info", { "deleteStatus": deleteResult.body });
}
