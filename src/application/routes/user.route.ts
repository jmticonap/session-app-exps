import { container } from 'tsyringe';
import UserController from '../controllers/user.controller';
import { RouteType } from '../../infrastructure/router-manager';

const userController = container.resolve(UserController);

export const userRoutes: Array<RouteType> = [
    {
        method: 'GET',
        path: '/user/greeting',
        handler: userController.greeting.bind(userController),
    },
    {
        method: 'GET',
        path: '/user/test',
        handler: userController.testTransaction.bind(userController),
    },
    {
        method: 'GET',
        path: '/user',
        handler: userController.findAll.bind(userController),
    },
    {
        method: 'GET',
        path: '/user/{id}',
        handler: userController.findById.bind(userController),
    },
    {
        method: 'POST',
        path: '/user',
        handler: userController.newUser.bind(userController),
    },
];

// export const userRoutes = new RoutesController(userController)
//     .addRoute({
//         method: 'GET',
//         path: '/user/greeting',
//         handler: 'greeting',
//     })
//     .addRoute({
//         method: 'GET',
//         path: '/user',
//         handler: 'findAll',
//     })
//     .addRoute({
//         method: 'GET',
//         path: '/user/{id}',
//         handler: 'findById',
//     })
//     .addRoute({
//         method: 'POST',
//         path: '/user',
//         handler: 'newUser',
//     });
