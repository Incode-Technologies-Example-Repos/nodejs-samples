import dotenv from 'dotenv';
import { Headers as HttpHeader } from 'node-fetch';
import { HttpRequest, IHttpResponse } from '../helpers/http-requests';
import { logger } from '../helpers/logger';
import { IClient } from '../interfaces';

dotenv.config();

export interface IPhoneParams {
    phone: string
}

export const addPhone = async (params: IPhoneParams, client: IClient, header: HttpHeader): Promise<IHttpResponse> => {
    const endpoint = "omni/add/phone"
    const url = `${client.apiUrl}/${endpoint}`;

    try {
        logger.info(`Doing ${endpoint}`, { key: client.requestId });
        const request = new HttpRequest();
        return request.doPost(url, header, params);

    } catch (error) {
        logger.error(`error- ${endpoint}`, { requestId: client.requestId, msg: `error making ${endpoint}` });
        throw Error(`internal error ${endpoint} failed`);
    }
};