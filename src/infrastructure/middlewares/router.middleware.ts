import http from 'node:http';
import { HttpMethod, HttpRequest } from '../../domain/types/route';
import { isPromise } from 'node:util/types';

export type HandlerIndex = (
    req: http.IncomingMessage,
    res: http.ServerResponse<http.IncomingMessage> & {
        req: http.IncomingMessage;
    },
) => any;

type RouteType = {
    method: HttpMethod;
    path: string;
    handler: (...args: any[]) => Promise<any> | any;
};

type MatchType = {
    match: boolean;
    [key: string]: string | boolean;
};

const match = (routePath: string, incomingPath: string): MatchType | null => {
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
};

export const RouterMiddleware = (routes: Array<RouteType>) => {
    return async (req: http.IncomingMessage, body?: string) => {
        const { method } = req;
        for (const route of routes) {
            const url = new URL(req.url!, `http://${req.headers.host}`);
            if (method !== route.method) continue;

            const isMatch = match(route.path, url.pathname);

            if (!isMatch?.match) continue;

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { match: mtc, ...params } = isMatch;
            const pathParameters: Record<string, string> = {};
            for (const [key, value] of Object.entries(params)) {
                if (typeof value === 'string') pathParameters[key] = value;
            }

            const request: HttpRequest = {
                method: req.method! as HttpMethod,
                url: req.url!,
                headers: req.headers,
                pathParameters,
                body: body ? JSON.parse(body) : undefined,
            };

            const result = route.handler(request, pathParameters);
            if (isPromise(result)) {
                const promiseResult = await result;
                console.dir(promiseResult, { deapth: null, colors: true });
                return promiseResult;
            } else {
                return result;
            }
        }
    };
};
