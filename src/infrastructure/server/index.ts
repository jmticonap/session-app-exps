import http from 'node:http';
import { HTTP_STATUS } from '../../domain/constants';
import { HttpMethod, HttpResponse } from '../../domain/types/route';
import EventEmitter from 'node:events';
import { container } from 'tsyringe';
import MysqlPoolConectionManager from '../db/mysql/mysql-pool-conection-manager';
import ConectionManager from '../db/conection-manager';

class HandlerExecutorManager extends EventEmitter {
    constructor(
        private req: http.IncomingMessage,
        private res: http.ServerResponse<http.IncomingMessage> & {
            req: http.IncomingMessage;
        },
    ) {
        super();
    }

    async execHandler(
        handler: (event: any, body?: string) => Promise<HttpResponse>,
        body?: string,
        timeout: number = 10_000,
    ) {
        const result = await Promise.race([
            new Promise<HttpResponse>((resolve) => {
                setTimeout(() => {
                    this.emit('timeout');
                    resolve({ statusCode: HTTP_STATUS.REQUEST_TIME_OUT, body: { error: 'TIMEOUT' } });
                }, timeout);
            }),
            new Promise<HttpResponse>((resolve) => {
                setTimeout(async () => {
                    const result = await handler(this.req, body);
                    this.emit('successful');
                    resolve(result);
                }, 0);
            }),
        ]);

        this.res.writeHead(result.statusCode, { 'Content-Type': 'application/json' });
        this.res.end(result && result.body ? JSON.stringify(result.body) : undefined);
    }
}

export const server = (host: string, port: number, handler: (event: any, body?: string) => Promise<HttpResponse>) => {
    const srv = http
        .createServer(async (req: http.IncomingMessage, res) => {
            const methodWithoutBody: HttpMethod[] = ['GET', 'HEAD'];
            const timeout = +(req.headers['timeout'] || '10000');
            try {
                let body = '';

                const hem = new HandlerExecutorManager(req, res);
                const conn = container.resolve<ConectionManager>(MysqlPoolConectionManager);
                await conn.getConnection();
                await conn.beginTransaction();
                hem.on('timeout', () => conn.rollback());
                hem.on('successful', () => conn.commit());

                req.on('error', (err) => {
                    res.end(JSON.stringify(err));
                });

                if (req.method && !methodWithoutBody.includes(<HttpMethod>req.method)) {
                    req.on('data', (chunk: string) => (body += chunk));
                    req.on('end', async () => await hem.execHandler(handler, body, timeout));
                } else {
                    await hem.execHandler(handler, body, timeout);
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
