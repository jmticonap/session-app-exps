import 'reflect-metadata';
import http from 'node:http';
import HttpServer from '../../../../src/application/server';
import { HttpRequest, HttpResponse } from '../../../../src/domain/types/route';
import ConsoleLogger from '../../../../src/infrastructure/logger/console.logger';
import EnvConfigurationRepository from '../../../../src/infrastructure/repository/env-configuration.repository';

jest.mock('http');
jest.mock('../../../../src/infrastructure/logger/console.logger');
jest.mock('../../../../src/infrastructure/repository/env-configuration.repository');

describe('HttpServer', () => {
    let server: HttpServer;
    let loggerMock: jest.Mocked<ConsoleLogger>;
    let configMock: jest.Mocked<EnvConfigurationRepository>;
    let httpServerMock: jest.Mocked<http.Server>;
    const serverListenMock = jest.fn((port, host, callback) => {
        if (callback) callback();
        return httpServerMock;
    });

    beforeEach(() => {
        loggerMock = new ConsoleLogger() as jest.Mocked<ConsoleLogger>;
        configMock = new EnvConfigurationRepository(loggerMock) as jest.Mocked<EnvConfigurationRepository>;

        configMock.get.mockReturnValue({
            nodeEnv: 'live',
            server: {
                live: {
                    port: 3030,
                    host: '127.0.0.1',
                },
                test: {
                    port: 8080,
                    host: '127.0.0.1',
                },
            },
            mysql: {
                live: {
                    host: 'localhost',
                    port: 3306,
                    user: 'root',
                    password: 'root',
                    database: 'database',
                },
                test: {
                    host: 'localhost',
                    port: 3306,
                    user: 'root',
                    password: 'root',
                    database: 'database',
                },
            },
        });

        server = new HttpServer(loggerMock, configMock);
        httpServerMock = {
            listen: serverListenMock,
            close: jest.fn((callback) => {
                if (callback) callback();
                return httpServerMock;
            }),
            on: jest.fn(),
        } as unknown as jest.Mocked<http.Server>;
        jest.spyOn(http, 'createServer').mockImplementation(() => httpServerMock);
    });

    afterEach(() => {
        httpServerMock.close.mockClear();
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    // it('should start server on correct host and port', () => {
    //     server = server.upServer();

    //     expect(http.createServer).toHaveBeenCalled();
    //     expect(serverListenMock).toHaveBeenCalledWith(3030, '127.0.0.1', expect.any(Function));
    // });

    // it('should add routes correctly', () => {
    //     const routes: Route[] = [{ path: '/test', method: 'GET', handler: jest.fn() }];

    //     server.routes(routes);

    //     expect(server['_routes']).toContain(routes[0]);
    // });

    it('should handle requests correctly', async () => {
        server
            .routes([
                {
                    method: 'GET',
                    path: '/user/greeting',
                    handler: async (req: HttpRequest): Promise<HttpResponse> => {
                        try {
                            return {
                                statusCode: 200,
                                body: { message: 'from greetings', headers: req.headers },
                            };
                        } catch (error) {
                            throw error;
                        }
                    },
                },
            ])
            .upServer();

        type Response = {
            statusCode: number | undefined;
            headers: http.OutgoingHttpHeaders;
            body: string | undefined;
        };

        const res = await new Promise<Response>((resolve) => {
            http.request(
                {
                    method: 'GET',
                    hostname: '127.0.0.1',
                    port: 3030,
                    path: '/user/greeting',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                (res) => {
                    let body = '';
                    res.on('data', (chunk) => {
                        body += chunk;
                    });
                    res.on('end', () => {
                        resolve({
                            statusCode: res.statusCode,
                            headers: res.headers,
                            body,
                        });
                    });
                },
            );
        });

        expect(res.statusCode).toBe(200);
        expect(res.headers).toHaveBeenCalledWith('Content-Type', 'application/json');
        // expect(res).toHaveBeenCalledWith(JSON.stringify({ success: true }));
    });

    // it('should handle errors correctly', async () => {
    //     const requestListener = (http.createServer as jest.Mock).mock.calls[0][0];
    //     const socket = new Socket();
    //     const req = new http.IncomingMessage(socket) as jest.Mocked<http.IncomingMessage>;
    //     const res = new http.ServerResponse(req) as unknown as jest.Mocked<http.ServerResponse>;

    //     req.method = 'POST';
    //     req.url = undefined;

    //     req.on = jest.fn().mockImplementation((event, callback) => {
    //         if (event === 'data') {
    //             callback(Buffer.from(''));
    //         } else if (event === 'end') {
    //             callback();
    //         } else if (event === 'error') {
    //             callback(new Error('Request error'));
    //         }
    //     });

    //     await requestListener(req, res);

    //     expect(loggerMock.error).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(Error) }));
    //     expect(res.statusCode).toBe(500);
    //     expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    //     expect(res.end).toHaveBeenCalledWith(expect.any(String));
    // });
});
