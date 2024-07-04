import { IncomingHttpHeaders, OutgoingHttpHeader } from 'node:http';

export type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';

export type HttpBaseMessage<T = any> = {
    body?: T;
};

export type HttpRequest<T = any> = HttpBaseMessage<T> & {
    method: HttpMethod;
    url: string;
    headers?: IncomingHttpHeaders;
    pathParameters?: Record<string, string>;
};

export type HttpResponse<T = any> = HttpBaseMessage<T> & {
    statusCode: number;
    headers?: OutgoingHttpHeader;
};
