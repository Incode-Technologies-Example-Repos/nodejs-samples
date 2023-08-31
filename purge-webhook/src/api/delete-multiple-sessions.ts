
import { HttpRequest } from '../helpers/http-requests';
import { logger } from '../helpers/logger';
import { IClient } from '../interfaces';


export const deleteSessions = async (client: IClient, header: any, interviewId: string) => {

    const endpoint = "omni/interviews";
    const url = `${client.apiUrl}/${endpoint}`;

    const params: any = {
        filter: {
            ids: [interviewId]
        },
        config: {
            deletePiiDataOnly: true,
            sendNotification: false,
            relatedEntitiesToKeep: [
                "deviceFingerPrints",
                "stats"
            ]
        }
    }

    try {
        logger.info(`Doing ${endpoint}`, {key: client.requestId});
        const request = new HttpRequest();
        return request.doDelete(url, header, params);

    } catch (error) {
        logger.error(`error- ${endpoint}`, { requestId: client.requestId, msg: `error making ${endpoint}` });
        throw Error(`error using ${endpoint}`);
    }
};