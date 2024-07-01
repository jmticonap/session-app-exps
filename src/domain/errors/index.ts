import { HTTP_STATUS } from '../constants';
import { LogLevel } from '../types';
import { HttpResponse } from '../types/route';

export class SessionError extends Error {
    constructor(
        message: string,
        public statusCode: number = HTTP_STATUS['BAD_REQUEST'],
        public level: LogLevel = 'WARN',
    ) {
        super(message);
    }

    errorResponse(): HttpResponse {
        return {
            statusCode: this.statusCode,
            body: { error: this.message },
        };
    }
}

export class BadRequestError extends SessionError {
    constructor() {
        super('BadRequest');
    }
}

export class SchemaValidationError extends SessionError {
    constructor(message = 'Error validating') {
        super(message);
    }
}
