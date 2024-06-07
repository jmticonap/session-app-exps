import { IncomingHttpHeaders, OutgoingHttpHeader } from 'node:http';
import { HandlerManager } from '../../infrastructure/router';

export type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';

export type HttpBaseMessage<T = any> = {
    body: T;
};

export type HttpRequest<T = string> = HttpBaseMessage<T> & {
    method: HttpMethod;
    url: string;
    headers?: IncomingHttpHeaders;
    pathParameters?: Record<string, any>;
};

export type HttpResponse<T = any> = HttpBaseMessage<T> & {
    statusCode: number;
    headers?: OutgoingHttpHeader;
};

export type Route<Request extends HttpRequest = HttpRequest, Response extends HttpResponse = HttpResponse> = {
    method: HttpMethod;
    path: string;
    handler: HandlerManager<Request, Response>;
};
