import 'reflect-metadata';
import HttpServer from './application/server';
import { container } from 'tsyringe';
import { routes } from './application/routes';

const httpServer = container.resolve(HttpServer);
httpServer.routes(routes).upServer();
