import dotenv from 'dotenv';
import { Headers as HttpHeader } from 'node-fetch';
import { IClient, IStartParams, } from '../interfaces';
import { HttpRequest, ISession } from '../helpers/http-requests';
import { logger } from '../helpers/logger';

dotenv.config();

export interface IStartResult {
    interviewId: string;
    token?: string;
    interviewCode?: string;
    idCaptureTimeout?: number;
    selfieCaptureTimeout?: number;
    idCaptureRetries?: number;
    selfieCaptureRetries?: number;
    curpValidationRetries?: number;
    clientId?: string;
    env?: string;
}


export const start = async (params: IStartParams, client: IClient): Promise<ISession> => {
    const endpoint = "omni/start";
    const url = `${client.apiUrl}/${endpoint}`;
    
    const p: any = {
        countryCode: params.countryCode || "ALL",
        language: params.language || "en-US",
        configurationId: client.apiFlowId
    }

    Object.keys(p).forEach(key => {
        if (p[key] == null) {
            delete p[key];
        }
    });

    const header = new HttpHeader();
    header.append('Content-Type', "application/json");
    header.append('x-api-key', client.apiKey);
    header.append('api-version', '1.0');

    try {
        logger.info(`Doing ${endpoint}`, {key: client.requestId});
        const request = new HttpRequest();
        const resp = await request.doPost(url, header, p);

        const startInfo = resp.body as IStartResult;
        const token = startInfo.token as string;
        header.append('x-incode-hardware-id', token);
        return {
            header: header,
            resp: startInfo
        } as ISession;

    } catch (error) {
        logger.error("error- omni/start", { requestId: client.requestId, msg: "error making omni/start" });
        throw Error("internal error omni/start failed");
    }
};