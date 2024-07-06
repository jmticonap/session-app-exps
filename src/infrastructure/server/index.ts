import http from 'node:http';
import { HTTP_STATUS } from '../../domain/constants';
import { HttpMethod, HttpResponse } from '../../domain/types/route';

export const server = (host: string, port: number, handler: (event: any, body?: string) => Promise<HttpResponse>) => {
    const srv = http
        .createServer(async (req: http.IncomingMessage, res) => {
            const methodWithoutBody: HttpMethod[] = ['GET', 'HEAD'];
            const timeout = +(req.headers['timeout'] || '10000');
            try {
                let body = '';

                const execHandler = async (handler: (event: any, body?: string) => Promise<HttpResponse>) => {
                    const result = await Promise.race([
                        new Promise<HttpResponse>((resolve) => {
                            setTimeout(
                                () => resolve({ statusCode: HTTP_STATUS.REQUEST_TIME_OUT, body: { error: 'TIMEOUT' } }),
                                timeout,
                            );
                        }),
                        handler(req, body),
                    ]);

                    res.writeHead(result.statusCode, { 'Content-Type': 'application/json' });
                    res.end(result && result.body ? JSON.stringify(result.body) : undefined);
                };

                req.on('error', (err) => {
                    res.end(JSON.stringify(err));
                });

                if (req.method && !methodWithoutBody.includes(<HttpMethod>req.method)) {
                    req.on('data', (chunk: string) => (body += chunk));
                    req.on('end', async () => await execHandler(handler));
                } else {
                    await execHandler(handler);
                }
            } catch (error) {
                res.end(JSON.stringify(error));
            }
        })
        .listen(port, host, () => {
            console.log(`Listening on\n http://127.0.0.1:${port}`);
        });

    return srv;
};
