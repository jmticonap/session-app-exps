import 'reflect-metadata';
import dotenv from 'dotenv';
import HttpServer from './application/server';
import { container } from 'tsyringe';
import { routes } from './application/routes';

dotenv.config({ path: './.env' });

const httpServer = container.resolve(HttpServer);
httpServer.routes(routes).upServer();
