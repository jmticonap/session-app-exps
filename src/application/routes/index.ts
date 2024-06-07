import { container } from 'tsyringe';
import { Route } from '../../domain/types/route';
import UserController from '../controllers/user.controller';
import { handler } from '../../infrastructure/router';

const userController = container.resolve(UserController);

export const routes: Route[] = [
    {
        method: 'GET',
        path: '/user/greeting',
        handler: handler(userController.greeting).use(async (): Promise<void> => {
            console.log('Hello fron midlewawre');
        }),
    },
];
