import { RoutesController } from '../../infrastructure/router';
import { userRoutes } from './user.route';

export const routes: RoutesController<any>[] = [userRoutes];
