import { HttpResponse } from '../../domain/types/route';
import { RouteType } from '../../infrastructure/router-manager';
import { userRoutes } from './user.route';

// export const routes: RoutesController<any>[] = [userRoutes];

export const routesV2: Array<RouteType> = [
    ...userRoutes,
    {
        method: 'GET',
        path: '/greeting',
        handler: (): Promise<HttpResponse> => {
            return Promise.resolve({
                statusCode: 200,
                body: { gretting: 'Hola a todos desde las rutas' },
            });
        },
    },
];
