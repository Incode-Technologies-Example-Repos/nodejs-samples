import { HttpRequest } from '../helpers/http-requests';
import { logger } from '../helpers/logger';
import { IClient, IResponse } from '../interfaces';

export interface IExecuitiveParams {
    email: string;
    password: string
}

export const executiveToken = async (client: IClient): Promise<IResponse> => {
    const endpoint = "executive/log-in";
    const url = `${client.apiUrl}/${endpoint}`;
    const params: IExecuitiveParams = {
        email: client.apiUser,
        password: client.apiPass
    }

    const exHeader = new Headers();
    exHeader.append('Content-Type', "application/json");
    exHeader.append('x-api-key', client.apiKey);
    exHeader.append('api-version', '1.0');

    try {
        logger.info(`Doing ${endpoint}`, { key: client.requestId });
        const request = new HttpRequest();
        const resp = await request.doPost(url, exHeader, params);
        const info = resp.body;

        const token = info.token as string;
        exHeader.set('x-incode-hardware-id', token);

        return {
            header: exHeader,
            resp: info
        } as IResponse;

    } catch (error) {
        logger.error(`error- ${endpoint}`, { requestId: client.requestId, msg: `error making ${endpoint}` });
        throw Error(`internal error ${endpoint} failed`);
    }
};