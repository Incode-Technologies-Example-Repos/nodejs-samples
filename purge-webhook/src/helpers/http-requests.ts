export interface IHttpResponse {
    status: number;
    headers: any;
    error: any;
    body: any;
    url: string;
}

export interface ISession {
    header: any,
    resp: any
}

export class HttpRequest {

    constructor() {}

    public async doGet(url: string, header: any, params?: any): Promise<IHttpResponse> {
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

    async doPost(url: string, header: any, params: any): Promise<IHttpResponse> {
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

    async doPut(url: string, header: any, params: any): Promise<IHttpResponse> {
        let response = await fetch(url, { method: 'PUT', body: JSON.stringify(params), headers: header });
        let json = await response.json()
        return {
            status: response.status,
            headers: response.headers,
            error: null,
            body: json,
            url: url
        }
    }

    async doDelete(url: string, header: any, params: any): Promise<IHttpResponse> {
        let response = await fetch(url, { method: 'DELETE', body: JSON.stringify(params), headers: header });
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