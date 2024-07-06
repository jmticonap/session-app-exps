import { inject, singleton } from 'tsyringe';
import mysql, { PoolConnection, RowDataPacket, PoolOptions } from 'mysql2/promise';
import ConectionManager from '../conection-manager';
import EnvConfigurationRepository from '../../repository/env-configuration.repository';
import Logger from '../../../domain/logger';
import ConfigurationRepository from '../../../domain/repository/configuration.repository';
import { MysqlConfiguration } from '../../../domain/types';
import ConsoleLogger from '../../logger/console.logger';
import MysqlUnitOfWork from './mysql-unit-of-work';

interface ConnectionMysql extends RowDataPacket {
    backendid: number;
}

const className = 'MysqlPoolConectionManager';

@singleton()
export default class MysqlPoolConectionManager extends MysqlUnitOfWork implements ConectionManager {
    private cnf: MysqlConfiguration;

    constructor(
        @inject(ConsoleLogger) _logger: Logger,
        @inject(EnvConfigurationRepository) private _config: ConfigurationRepository,
    ) {
        super(className, _logger);
        const cnf = this._config.get();
        this.cnf = cnf.mysql[cnf.nodeEnv];
    }

    async getConnection(config?: PoolOptions): Promise<PoolConnection> {
        const method = this.getConnection.name;
        try {
            if (this._poolConnection) {
                console.log('Return connection created before');
                return this._poolConnection as PoolConnection;
            }

            const cnnOpt: PoolOptions = {
                host: this.cnf.host,
                port: +this.cnf.port,
                user: this.cnf.user,
                password: this.cnf.password,
                database: this.cnf.database,
                connectTimeout: 10_000,
                connectionLimit: 10,
            };
            this._logger.info({ className, method, object: config || cnnOpt, message: 'Connection pool data' });
            this._poolConnection = await mysql.createPool(config || cnnOpt).getConnection();

            const [rows] = await this._poolConnection.query<ConnectionMysql[]>('SELECT CONNECTION_ID() as backendid');
            this._logger.info({
                className,
                method,
                object: { databaseConnection: { connected: true, id: rows[0].backendid } },
                message: `Connection with id ${rows[0].backendid} has been created.`,
            });

            return this._poolConnection as PoolConnection;
        } catch (error) {
            this._logger.error({ className, method, message: 'Error open connection pool', error: <Error>error });

            throw error;
        }
    }
}
