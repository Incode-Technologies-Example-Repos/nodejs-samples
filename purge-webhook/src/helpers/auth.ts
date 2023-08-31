import { executiveToken } from "../api/executive-token";
import { IClient, IResponse } from "../interfaces";

export class Auth {
    exHeader: any;
    private client: IClient

    constructor(client: IClient) {
        this.client = client
    }

    async getLoginHeader() {
        this.exHeader = await executiveToken(this.client) as IResponse;
        return this.exHeader.header;
    }
};