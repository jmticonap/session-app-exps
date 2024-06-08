import { container } from 'tsyringe';
import { HTTP_STATUS } from '../../domain/constants';
import { SessionError } from '../../domain/errors';
import { HttpMethod, HttpRequest, HttpResponse } from '../../domain/types/route';
import ConsoleLogger from '../logger/console.logger';

type MatchType = {
    match: boolean;
    [key: string]: string | boolean;
};

export type HandlerType = (...args: any[]) => Promise<any>;
export type RouteType = {
    method: HttpMethod;
    path: string;
    midlewares?: Array<HandlerType>;
    handler: HandlerType;
};

export class RoutesController<Controller> {
    public routes: Array<RouteType> = [];
    method: any;
    path: any;
    constructor(private _controller: Controller) {}

    addRoute<F extends keyof Controller>({
        method,
        path,
        handler,
        midlewares,
    }: {
        method: HttpMethod;
        path: string;
        handler: F;
        midlewares?: Array<HandlerType>;
    }): this {
        this.routes.push({
            method,
            path,
            handler: async (...args: any[]) => {
                return await new Promise(async (resolve, reject) => {
                    try {
                        if (midlewares) {
                            for (const midleware of midlewares) {
                                const result = await midleware(...args);
                                if (result) return result;
                            }
                        }
                        // eslint-disable-next-line @typescript-eslint/ban-types
                        resolve(await (<Function>this._controller[handler]).bind(this._controller)(...args));
                    } catch (error) {
                        reject(error);
                    }
                });
            },
        });

        return this;
    }
}

export default class Router<Request extends HttpRequest = HttpRequest> {
    private _routes: Array<RoutesController<any>> = [];
    private _logger = container.resolve(ConsoleLogger);

    constructor(routes?: Array<RoutesController<any>>) {
        if (routes) this._routes.push(...routes);
    }

    pushRoutes(routes: Array<RoutesController<any>>) {
        this._routes.push(...routes);

        return this;
    }

    routeList(): void {
        const routes = this._routes.flatMap(({ routes }) => routes.map(({ path, method }) => ({ path, method })));
        for (const { method, path } of routes) {
            console.log(`[${method}]`, '\t', path);
        }
    }

    async execRequest(req: Request): Promise<HttpResponse> {
        if (!req.url) throw new Error("Url can't be undefined, null or empty");
        const method = req.method;
        let matchRoute: RouteType | undefined;
        let matchParams: { [key: string]: string | boolean } | undefined;

        for (const routeController of this._routes) {
            for (const route of routeController.routes) {
                const r = <RouteType>route;

                if (method && r.method === method) {
                    const incomingPath = req.url;
                    const routePath = r.path;

                    let isMatch: MatchType | null;
                    if (incomingPath === '/' && (routePath === '' || routePath === '/')) {
                        isMatch = { match: true };
                    } else {
                        isMatch = this.match(routePath, incomingPath);
                    }

                    if (isMatch && isMatch.match) {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { match, ...params } = isMatch;
                        matchParams = params;
                        matchRoute = route;
                        break;
                    }
                }
            }
        }
        try {
            if (!matchRoute)
                throw new SessionError(
                    'The route must be diferent from undefined',
                    HTTP_STATUS['INTERNAL_SERVER_ERROR'],
                );

            this.loadPathParameters(req, matchParams);

            return await matchRoute.handler(req, { ...matchParams });
        } catch (error) {
            if (error instanceof SessionError) {
                return error.errorResponse();
            } else {
                return {
                    statusCode: HTTP_STATUS['INTERNAL_SERVER_ERROR'],
                    body: { error },
                };
            }
        }
    }

    loadPathParameters(req: Request, params: { [key: string]: string | boolean } | undefined): void {
        if (!req.pathParameters) this._logger.warn({ message: 'PathParameters is undefined' });
        if (req.pathParameters && params)
            for (const [key, value] of Object.entries(params)) {
                req.pathParameters[key] = value;
            }
    }

    match(routePath: string, incomingPath: string): MatchType | null {
        const regexPattern = routePath.replace(/{([^}]+)}/g, '([^/]+)');
        const regex = new RegExp(`^${regexPattern}$`);

        const match = incomingPath.match(regex);
        const params: MatchType = { match: false };

        if (match) {
            const paramNames = [...routePath.matchAll(/{([^}]+)}/g)].map((match) => match[1]);

            paramNames.forEach((name, index) => {
                params[name] = match[index + 1];
            });
            params['match'] = true;
        }

        return params;
    }
}
