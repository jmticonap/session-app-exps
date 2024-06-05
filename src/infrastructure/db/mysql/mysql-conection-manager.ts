import { Lifecycle, inject, scoped } from 'tsyringe';
import mysql, { Connection, ConnectionOptions, RowDataPacket } from 'mysql2/promise';
import ConectionManager from '../conection-manager';
import EnvConfigurationRepository from '../../repository/env-configuration.repository';
import Logger from '../../../domain/logger';
import ConfigurationRepository from '../../../domain/repository/configuration.repository';
import { MysqlConfiguration } from '../../../domain/types';
import ConsoleLogger from '../../logger/console.logger';

interface ConnectionMysql extends RowDataPacket {
    backendid: number;
}

const className = 'MysqlConectionManager';

@scoped(Lifecycle.ResolutionScoped)
export default class MysqlConectionManager implements ConectionManager {
    private cnf: MysqlConfiguration;
    private _connection: Connection | undefined;

    constructor(
        @inject(ConsoleLogger) private _logger: Logger,
        @inject(EnvConfigurationRepository) private _config: ConfigurationRepository,
    ) {
        const cnf = this._config.get();
        this.cnf = cnf.mysql[cnf.nodeEnv];
    }

    async getConnection(config?: ConnectionOptions): Promise<Connection> {
        const method = this.getConnection.name;
        try {
            const cnnOpt: ConnectionOptions = {
                host: this.cnf.host,
                port: +this.cnf.port,
                user: this.cnf.user,
                password: this.cnf.password,
                database: this.cnf.database,
                connectTimeout: 10_000,
            };
            this._connection = await mysql.createConnection(config || cnnOpt);

            const [rows] = await this._connection.query<ConnectionMysql[]>('SELECT CONNECTION_ID() as backendid');
            this._logger.info({
                className,
                method,
                object: { databaseConnection: { connected: true, id: rows[0].backendid } },
                message: `Connection with id ${rows[0].backendid} has been created.`,
            });

            return this._connection;
        } catch (error) {
            this._logger.error({ className, method, error: <Error>error });
            throw error;
        }
    }
}
