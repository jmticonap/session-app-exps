import { createServer } from 'node:http';
import { HandlerIndex, RouterMiddleware } from '../../../../src/infrastructure/middlewares/router.middleware';
import { RouteType } from '../../../../src/infrastructure/router-manager';
import { middleware } from '../../../../src/infrastructure/middleware-manager';
import HttpClient from '../../../../src/infrastructure/http/http-client';

const server = (handler: HandlerIndex, port = 3000) => {
    const srv = createServer(handler);

    // starts a simple http server locally on port 3000
    srv.listen(port, '127.0.0.1', () => {
        console.log('Listening on 127.0.0.1:3000');
    });

    return srv;
};

describe('RouterMiddleware test suite', () => {
    const sut = RouterMiddleware;

    const routes: Array<RouteType> = [
        {
            method: 'GET',
            path: '/path/user',
            handler: (): Promise<string> => {
                return new Promise((resolve) => resolve('user path'));
            },
        },
        {
            method: 'GET',
            path: '/path/archive',
            handler: (): Promise<string> => {
                return new Promise((resolve) => resolve('archive path'));
            },
        },
    ];

    it('should execute the handler', async () => {
        const port = 3000;
        const handler = middleware().handler(sut(routes));
        let srv: any = server(handler, port);

        process.nextTick(() => {});

        const httpClient = new HttpClient();
        const response = await httpClient.get(`http://127.0.0.1:${port}/path/user`, {
            headers: {},
            timeout: 1000,
        });

        expect(response.body).toBe('user path');

        srv.closeAllConnections();
        srv = undefined;
    });
});
