import dotenv from 'dotenv';
import { Headers as HttpHeader } from 'node-fetch';
import { generate } from 'short-uuid';
import { executiveToken } from './api/executive-token';
import { sms, ISMSParams } from './api/sms';
import { IStartResult, start } from './api/start';
import { logger } from './helpers/logger';
import { IClient, IStartParams, IWebHookParams } from './interfaces';
import { IPhoneParams, addPhone } from './api/add-phone';

dotenv.config();

export interface ISMSFlowParams {
    webhookParams: IWebHookParams,
    phoneNumber: string
}

export class SMSFlow {
    private client: IClient
    private startInfo: IStartResult;
    private phoneNumber: string


    private header: HttpHeader;
    private executiveHeader: HttpHeader;
    private webHookParams: IWebHookParams;

    constructor(smsParams: ISMSFlowParams | undefined) {
        if (smsParams) {
            this.webHookParams = smsParams.webhookParams;
            this.phoneNumber = smsParams.phoneNumber;
            this.initEnvironment();
        }
    }

    async run() {
        await this._start();
        console.log("Phone!!!")
        const p = await this._addPhone();
        console.log("Never goes here")
        await this._executiveToken();
        await this._sms();
        logger.warn("Incode Flow Done", { requestId: this.client.requestId, interviewId: this.webHookParams.interviewId });
    }

    private async _start() {
        const params: IStartParams = {
            interviewId: this.webHookParams?.interviewId,
            externalId: this.webHookParams?.externalId
        }
        const session = await start(params, this.client);
        this.header = session.header;
        this.startInfo = session.resp;
    }

    private async _addPhone() {
        const params: IPhoneParams = {
            phone: this.phoneNumber
        }
        return addPhone(params, this.client, this.header);  
    }

    private async _executiveToken() {
        logger.info(`WTF`, {});
        const executive = await executiveToken(this.client);
        this.executiveHeader = executive.header;
    }

    private async _sms() {
        let text = "";
        if (this.webHookParams.onboardingStatus === "ONBOARDING_FINISHED") {
            text = `You have a new enrollment: ${this.client.apiUrl}/single-session/${this.webHookParams.interviewId}`
        } else if (this.webHookParams.onboardingStatus === "EXPIRED") {
            text = `A user did not finish: ${this.client.apiUrl}/single-session/${this.webHookParams.interviewId}`
        }
        const params: ISMSParams = {
            clientId: this.client.apiClientId,
            interviewId: this.startInfo.interviewId,
            smsText: text
        }
        const message = await sms(params, this.client, this.executiveHeader);
        logger.warn("Incode SMS status", message);
    }

    initEnvironment() {
        const apiUrl = process.env.API_URL as string;
        const apiClientId = process.env.API_CLIENT_ID as string;
        const apiKey = process.env.API_KEY as string;
        const apiUser = process.env.API_USER as string;
        const apiPass = process.env.API_PASS as string;
        const apiFlow = process.env.API_FLOW_ID as string;

        this.client = {
            apiUrl: apiUrl,
            apiClientId: apiClientId,
            apiKey: apiKey,
            apiUser: apiUser,
            apiPass: apiPass,
            apiFlowId: apiFlow,
            requestId: this.webHookParams.requestId || generate()
        }
    }
}