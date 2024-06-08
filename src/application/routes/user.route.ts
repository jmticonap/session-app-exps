import { container } from 'tsyringe';
import UserController from '../controllers/user.controller';
import { RoutesController } from '../../infrastructure/router';

const userController = container.resolve(UserController);

export const userRoutes = new RoutesController(userController)
    .addRoute({
        method: 'GET',
        path: '/user/greeting',
        handler: 'greeting',
    })
    .addRoute({
        method: 'GET',
        path: '/user',
        handler: 'findAll',
    })
    .addRoute({
        method: 'GET',
        path: '/user/{id}',
        handler: 'findById',
    })
    .addRoute({
        method: 'POST',
        path: '/user',
        handler: 'newUser',
    });
