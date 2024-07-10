import 'reflect-metadata';
import { routesV2 } from './application/routes';
import { RouterMiddleware } from './infrastructure/middlewares/router.middleware';
import { middleware } from './infrastructure/middleware-manager';
import { server } from './infrastructure/server';
import { switchMiddleware } from './infrastructure/middlewares/switch.middleware';

const port = 3030;
const host = '127.0.0.1';
const handler = middleware().use(switchMiddleware()).handler(RouterMiddleware(routesV2));

server(host, port, handler);
