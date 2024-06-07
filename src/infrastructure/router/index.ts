import { container } from 'tsyringe';
import { HTTP_STATUS } from '../../domain/constants';
import { SessionError } from '../../domain/errors';
import { HttpRequest, HttpResponse, Route } from '../../domain/types/route';
import { isPromise } from 'node:util/types';
import ConsoleLogger from '../logger/console.logger';

type MatchType = {
    match: boolean;
    [key: string]: string | boolean;
};

export class HandlerManager<Request extends HttpRequest = HttpRequest, Response extends HttpResponse = HttpResponse> {
    middleware: Array<(req: Request, ctx: Record<string, any>) => Promise<Response | void>> = [];
    executable?: (req: Request, ctx: Record<string, any>) => Promise<Response>;

    constructor(handler: (req: Request, ctx: Record<string, any>) => Promise<Response>) {
        this.executable = handler;
    }

    use(handler: (req: Request, ctx: Record<string, any>) => Promise<Response | void>): this {
        this.middleware.push(handler);

        return this;
    }

    handler(handler: (req: Request, ctx: Record<string, any>) => Promise<Response>): void {
        this.executable = handler;
    }
}

export const handler = <Request extends HttpRequest = HttpRequest, Response extends HttpResponse = HttpResponse>(
    handler: (req: Request, ctx: Record<string, any>) => Promise<Response>,
) => {
    return new HandlerManager(handler);
};

export default class Router<Request extends HttpRequest = HttpRequest, Response extends HttpResponse = HttpResponse> {
    private _routes: Array<Route<Request, Response>> = [];
    private _logger = container.resolve(ConsoleLogger);

    constructor(routes?: Array<Route<Request, Response>>) {
        if (routes) this._routes.push(...routes);
    }

    pushRoutes(routes: Array<Route<Request, Response>>) {
        this._routes.push(...routes);

        return this;
    }

    async execRequest(req: Request): Promise<HttpResponse> {
        if (!req.url) throw new Error("Url can't be undefined, null or empty");
        const method = req.method;
        let matchRoute: Route<Request, Response> | undefined;
        let matchParams: { [key: string]: string | boolean } | undefined;

        for (const route of this._routes) {
            if (method && route.method === method) {
                const incomingPath = req.url;
                const routePath = route.path;

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
        try {
            if (!matchRoute)
                throw new SessionError(
                    'The route must be diferent from undefined',
                    HTTP_STATUS['INTERNAL_SERVER_ERROR'],
                );

            this.loadPathParameters(req, matchParams);

            for (const mdlw of matchRoute.handler.middleware) {
                const mdlwResult = await mdlw(req, { ...matchParams });
                if (mdlwResult) {
                    return mdlwResult as HttpResponse;
                }
            }

            return await matchRoute.handler.executable!(req, { ...matchParams });
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
