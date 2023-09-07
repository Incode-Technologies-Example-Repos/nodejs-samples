import fetch, { Headers as HttpHeader } from 'node-fetch';

export interface IHttpResponse {
    status: number;
    headers: any;
    error: any;
    body: any;
    url: string;
}

export interface ISession {
    header: HttpHeader,
    resp: any
}

export class HttpRequest {

    constructor() {}

    public async doGet(url: string, header: HttpHeader, params?: any): Promise<IHttpResponse> {
        if (params) {
            const _params = new URLSearchParams(params);
            url = `${url}?${_params.toString()}`
        }

        const response = await fetch(url, { headers: header });
        const json = await response.json();
        return {
            status: response.status,
            headers: response.headers,
            error: null,
            body: json,
            url: url
        }
    }

    async doPost(url: string, header: HttpHeader, params: any): Promise<IHttpResponse> {
        let response = await fetch(url, { method: 'POST', body: JSON.stringify(params), headers: header });
        let json = await response.json()
        return {
            status: response.status,
            headers: response.headers,
            error: null,
            body: json,
            url: url
        }
    }
}