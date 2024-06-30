import { RequestOptions as ReqOptionsHttps, request as ReqHttps } from 'node:https';
import { RequestOptions as ReqOptionsHttp, request as ReqHttp, IncomingMessage, ClientRequest } from 'node:http';
import { SessionError } from '../../domain/errors';
import { HttpMethod, InHttpHeaders, ProtocolType, RequestOptions, ResponseClient } from './types';
import { HTTP_STATUS } from '../../domain/constants';

export default class HttpClient {
    async post<RESULT = any, BODY = any>(fullUrl: string, req: RequestOptions<BODY>): Promise<ResponseClient<RESULT>> {
        return await this.sendRequest<RESULT, BODY>('POST', fullUrl, req);
    }

    async get<RESULT = any, BODY = any>(fullUrl: string, req: RequestOptions<BODY>): Promise<ResponseClient<RESULT>> {
        return await this.sendRequest<RESULT, BODY>('GET', fullUrl, req);
    }

    async delete<RESULT = any, BODY = any>(
        fullUrl: string,
        req: RequestOptions<BODY>,
    ): Promise<ResponseClient<RESULT>> {
        return await this.sendRequest<RESULT, BODY>('DELETE', fullUrl, req);
    }

    private sendRequest<RESULT = any, BODY = any>(
        method: HttpMethod,
        fullUrl: string,
        req: RequestOptions<BODY>,
    ): Promise<ResponseClient<RESULT>> {
        if (!URL.canParse(fullUrl)) throw new SessionError('Parameter can not be parse as URL');
        const url = new URL(fullUrl);

        req.method = method;
        req.protocol = <ProtocolType>url.protocol;
        req.host = url.host;
        req.hostname = url.hostname;
        req.port = url.port;
        req.path = `${url.pathname}${this.parseSearchParams(req.searchParams)}`;

        this.fillHeadersDefaults(req);

        const { protocol, host, hostname, port, path, timeout } = req;
        const senderOptions: Record<ProtocolType, ReqOptionsHttps | ReqOptionsHttp> = {
            'https:': {
                headers: req.headers,
                method,
                protocol,
                host,
                hostname,
                port,
                path,
                timeout,
            } as ReqOptionsHttps,
            'http:': {
                headers: req.headers,
                method,
                protocol,
                host,
                hostname,
                port,
                path,
                timeout,
            } as ReqOptionsHttp,
        };

        const request = req.protocol === <ProtocolType>'https:' ? ReqHttps : ReqHttp;

        const result = new Promise<ResponseClient<RESULT>>((resolve, reject) => {
            try {
                const opt = senderOptions[req.protocol!];
                const inReq: ClientRequest = request(opt, (res: IncomingMessage) => {
                    let backData = '';

                    res.setEncoding('utf8');
                    res.on('data', (chunk) => (backData += chunk));
                    res.on('error', (err) => reject(err));
                    res.on('end', () => {
                        const result: ResponseClient<RESULT> = {
                            statusCode: res.statusCode,
                            heders: res.headers as InHttpHeaders,
                            body:
                                res.headers['content-type'] === 'application/json'
                                    ? backData
                                        ? (JSON.parse(backData) as RESULT)
                                        : undefined
                                    : backData
                                      ? (backData as RESULT)
                                      : undefined,
                        };
                        resolve(result);
                    });
                });
                inReq.on('error', (err) => reject(err));
                inReq.on('timeout', () => {
                    reject(new SessionError('Timeout error', HTTP_STATUS['REQUEST_TIME_OUT'], 'ERROR'));
                });
                if (req.body) inReq.write(typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
                inReq.end();
            } catch (error) {
                reject(error);
            }
        });

        return result;
    }

    private parseSearchParams(searchParams?: Record<string, string>): string {
        try {
            if (!searchParams) throw new SessionError('SearchParams is undefined');

            const params = new URLSearchParams();

            for (const [key, value] of Object.entries(searchParams)) {
                params.append(key, value);
            }

            return `?${params.toString()}`;
        } catch (error) {
            console.warn(error);
            return '';
        }
    }

    private fillHeadersDefaults(req: RequestOptions): void {
        const noBody: Array<HttpMethod> = ['GET', 'DELETE', 'HEAD', 'OPTIONS'];
        if (!req.headers['accept']) req.headers['accept'] = '*/*';
        if (!req.headers['accept-encoding']) req.headers['accept-encoding'] = 'gzip, deflate, br, zstd';
        if (!req.headers['connection']) req.headers['connection'] = 'keep-alive';
        if (!req.headers['host']) req.headers['host'] = req.host as string | undefined;
        if (!noBody.includes(<HttpMethod>req.method!) && !req.headers['content-type'])
            req.headers['content-type'] = 'application/json';
        if (!req.headers['content-length'] && req.body)
            req.headers['content-length'] = Buffer.byteLength(
                typeof req.body === 'string' ? req.body : JSON.stringify(req.body),
            ).toString();
        if (!req.headers['user-agent']) req.headers['user-agent'] = 'HttpClient/1.0.0';
    }
}
