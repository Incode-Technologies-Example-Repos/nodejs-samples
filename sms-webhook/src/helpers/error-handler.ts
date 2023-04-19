import { logger } from './logger';
import { HttpStatusCode } from '../interfaces';

class BaseError extends Error {
    public readonly name: string;
    public readonly httpCode: HttpStatusCode;
    public readonly isOperational: boolean;

    constructor(name: string, httpCode: HttpStatusCode, description: string, isOperational: boolean) {
        super(description);
        Object.setPrototypeOf(this, new.target.prototype);

        this.name = name;
        this.httpCode = httpCode;
        this.isOperational = isOperational;

        Error.captureStackTrace(this);
    }
}

export class ApiError extends BaseError {
    public readonly url: string | undefined;
    constructor(
        name: string,
        httpCode = HttpStatusCode.INTERNAL_SERVER,
        isOperational = true,
        description = 'Custom internal server error.',
        url?: string) {
        super(name, httpCode, description, isOperational);
        this.url = url;
    }
}

class ErrorHandler {
    async handleError(err: Error): Promise<void> {
        await logger.warn(
            '--Log-- ',
            err,
        );
    }

    public isTrustedError(error: Error) {
        if (error instanceof BaseError) {
            return error.isOperational;
        }
        return false;
    }
}

export const errorHandler = new ErrorHandler();