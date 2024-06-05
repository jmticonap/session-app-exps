import { IncomingHttpHeaders, OutgoingHttpHeader } from 'node:http';

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

export type Handler<Request extends HttpRequest = HttpRequest, Response extends HttpResponse = HttpResponse> = (
    req: Request,
    ctx: Record<string, any>,
) => Promise<Response>;

export type Route<Request extends HttpRequest = HttpRequest, Response extends HttpResponse = HttpResponse> = {
    method: HttpMethod;
    path: string;
    handler: Handler<Request, Response>;
};
