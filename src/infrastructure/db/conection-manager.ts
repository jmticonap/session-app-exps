import { Connection, PoolConnection, ConnectionOptions } from 'mysql2/promise';

export default interface ConectionManager {
    getConnection(config?: ConnectionOptions): Promise<Connection | PoolConnection>;
}
