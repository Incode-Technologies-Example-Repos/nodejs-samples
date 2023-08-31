export enum HttpStatusCode {
    OK = 200,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    INTERNAL_SERVER = 500,
}

export interface IWebHookParams {
    interviewId: string;
    externalId: string;
    onboardingStatus: string;
    requestId: string;
    time?: number;
}

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

export interface IStartParams {
    interviewId?: string | undefined;
    externalId?: string | undefined;
    countryCode?: string;
    language?: string;
    configurationId?: string | undefined;
}

export interface IClient {
    apiUrl: string;
    apiClientId: string;
    apiKey: string;
    requestId: string;
    apiUser: string;
    apiPass: string;
}

export interface IResponse {
    header: any;
    resp: any;
}
