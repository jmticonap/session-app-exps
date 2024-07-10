import { Lifecycle, inject, scoped } from 'tsyringe';
import mysql, { Connection, ConnectionOptions, RowDataPacket } from 'mysql2/promise';
import ConectionManager from '../conection-manager';
import EnvConfigurationRepository from '../../repository/env-configuration.repository';
import Logger from '../../logger/logger';
import ConfigurationRepository from '../../../domain/repository/configuration.repository';
import { MysqlConfiguration } from '../../../domain/types';
import ConsoleLogger from '../../logger/console/console.logger';
import { SessionError } from '../../../domain/errors';
import { HTTP_STATUS } from '../../../domain/constants';
import MysqlUnitOfWork from './mysql-unit-of-work';

interface ConnectionMysql extends RowDataPacket {
    backendid: number;
}

const className = 'MysqlConectionManager';

@scoped(Lifecycle.ResolutionScoped)
export default class MysqlConectionManager extends MysqlUnitOfWork implements ConectionManager {
    private cnf: MysqlConfiguration;
    private _connection: Connection | undefined;

    constructor(
        @inject(ConsoleLogger) _logger: Logger,
        @inject(EnvConfigurationRepository) private _config: ConfigurationRepository,
    ) {
        super(className, _logger);

        const cnf = this._config.get();
        this.cnf = cnf.mysql[cnf.nodeEnv];

        this._logger.info({ className, message: 'MysqlConectionManager created successfully', object: this.cnf });
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
            const err = error as SessionError;
            err.level = 'ERROR';
            err.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;

            throw err;
        }
    }
}
