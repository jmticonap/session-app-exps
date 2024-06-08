import { container } from 'tsyringe';
import { Route } from '../../domain/types/route';
import { handler } from '../../infrastructure/router';
import UserController from '../controllers/user.controller';

const userController = container.resolve(UserController);

export const userRoutes: Route[] = [
    {
        method: 'GET',
        path: '/user/greeting',
        handler: handler(userController.greeting.bind(userController)).use(async (): Promise<void> => {
            console.log('Hello fron midlewawre');
        }),
    },
    {
        method: 'GET',
        path: '/user',
        handler: handler(userController.findAll.bind(userController)),
    },
    {
        method: 'GET',
        path: '/user/{id}',
        handler: handler(userController.findById.bind(userController)),
    },
    {
        method: 'POST',
        path: '/user',
        handler: handler(userController.newUser.bind(userController)),
    },
];
