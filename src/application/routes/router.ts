import { container } from 'tsyringe';
import { HTTP_STATUS } from '../../domain/constants';
import { SessionError } from '../../domain/errors';
import { HttpRequest, HttpResponse, Route } from '../../domain/types/route';
import { isPromise } from 'node:util/types';
import ConsoleLogger from '../../infrastructure/logger/console.logger';

type MatchType = {
    match: boolean;
    [key: string]: string | boolean;
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

    async execRequest(req: Request) {
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

            if (isPromise(matchRoute.handler)) {
                return await matchRoute.handler(req, { ...matchParams });
            } else {
                return matchRoute.handler(req, { ...matchParams });
            }
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
