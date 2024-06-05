import { container } from 'tsyringe';
import { Route } from '../../domain/types/route';
import UserController from '../controllers/user.controller';

const userController = container.resolve(UserController);

export const routes: Route[] = [
    {
        method: 'GET',
        path: '/user/greeting',
        handler: userController.greeting,
    },
];
