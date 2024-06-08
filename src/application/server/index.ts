import http from 'node:http';
import { inject, injectable } from 'tsyringe';
import ConsoleLogger from '../../infrastructure/logger/console.logger';
import Logger from '../../domain/logger';
import EnvConfigurationRepository from '../../infrastructure/repository/env-configuration.repository';
import ConfigurationRepository from '../../domain/repository/configuration.repository';
import { HttpMethod } from '../../domain/types/route';
import { HTTP_STATUS } from '../../domain/constants';
import { SessionError } from '../../domain/errors';
import Router from '../../infrastructure/router';

@injectable()
export default class HttpServer {
    private server: http.Server | undefined;
    private host: string;
    private port: number;
    private _methodWithBody: HttpMethod[] = ['POST', 'PATCH'];
    private _router: Router | undefined;

    constructor(
        @inject(ConsoleLogger) private _logger: Logger,
        @inject(EnvConfigurationRepository) config: ConfigurationRepository,
    ) {
        const cnf = config.get();
        const cnfServer = cnf.server[cnf.nodeEnv];
        this.host = cnfServer.host;
        this.port = cnfServer.port;
    }

    routes(routes: Array<any>) {
        this._router = new Router(routes);

        return this;
    }

    upServer() {
        this.server = http.createServer(async (req, res) => {
            let body = '';

            req.on('error', (err) => this.responseError(res, err));

            if (req.method && this._methodWithBody.includes(<HttpMethod>req.method)) {
                console.info('WITH BODY');
                req.on('data', (chunk: string) => {
                    console.log('DATA:', chunk);
                    body += chunk;
                });
                req.on('end', async () => await this.execute(req, res, body));
            } else {
                await this.execute(req, res);
            }
        });

        this.server.listen(this.port, this.host, () => {
            console.log(`Server running at http://${this.host}:${this.port}/`);
            this._router?.routeList();
        });

        return this;
    }

    downServer() {
        this.server?.close((err) => {
            if (err) console.error(err);
        });
    }

    private async execute(
        req: http.IncomingMessage,
        res: http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage },
        body = '',
    ) {
        try {
            if (!req.url) throw new SessionError('Url must be diferent from undefined');
            if (!req.method) throw new SessionError('Method must be diferent from undefined');
            if (!this._router) throw new SessionError('Router must be setup');

            const result = await this._router.execRequest({
                headers: req.headers,
                body,
                method: <HttpMethod>req.method,
                url: req.url,
            });

            res.writeHead(result.statusCode, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.body));
        } catch (error) {
            this._logger.error({ message: 'ERROR INTERNO DEL SERVIDOR', error: <Error>error });
            this.responseError(res, error);
        }
    }

    private responseError(
        res: http.ServerResponse<http.IncomingMessage> & {
            req: http.IncomingMessage;
        },
        err: unknown,
    ) {
        res.writeHead(HTTP_STATUS['INTERNAL_SERVER_ERROR'], { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(err));
    }
}
