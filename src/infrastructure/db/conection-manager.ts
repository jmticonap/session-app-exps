import { Connection, PoolConnection, ConnectionOptions } from 'mysql2/promise';
import UnitOfWork from './unit-of-work';

export default interface ConectionManager extends UnitOfWork {
    getConnection(config?: ConnectionOptions): Promise<Connection | PoolConnection>;
}
