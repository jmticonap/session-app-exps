import { OutgoingHttpHeaders, IncomingHttpHeaders as InHeaders } from 'node:http';
import { RequestOptions as ReqOptionsHttps } from 'node:https';

export type ContentType =
    | 'text/plain'
    | 'text/html'
    | 'text/css'
    | 'text/javascript'
    | 'application/json'
    | 'application/xml'
    | 'application/x-www-form-urlencoded'
    | 'application/pdf'
    | 'application/msword'
    | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    | 'application/vnd.ms-excel'
    | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    | 'application/vnd.ms-powerpoint'
    | 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    | 'image/jpeg'
    | 'image/png'
    | 'image/gif'
    | 'image/bmp'
    | 'image/webp'
    | 'image/svg+xml'
    | 'audio/mpeg'
    | 'audio/wav'
    | 'audio/ogg'
    | 'video/mp4'
    | 'video/webm'
    | 'video/ogg'
    | 'multipart/form-data'
    | 'application/octet-stream'
    | 'application/zip';

export type ProtocolType = 'http:' | 'https:';

export type HttpHeaders = OutgoingHttpHeaders & {
    'content-type'?: ContentType;
    [key: string]: string | undefined;
};

export type InHttpHeaders = InHeaders & {
    [key: string]: string | undefined;
};

export type RequestOptions<B = any> = ReqOptionsHttps & {
    headers: HttpHeaders;
    body?: B;
    searchParams?: Record<string, string>;
};

export type ResponseClient<BODY = any> = {
    statusCode?: number;
    heders: InHttpHeaders;
    body?: BODY;
};
