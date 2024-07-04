import 'reflect-metadata';
import { routesV2 } from './application/routes';
import { RouterMiddleware } from './infrastructure/middlewares/router.middleware';
import { middleware } from './infrastructure/middleware-manager';
import { server } from './infrastructure/server';

const port = 3030;
const host = '127.0.0.1';
const handler = middleware().handler(RouterMiddleware(routesV2));

server(host, port, handler);
