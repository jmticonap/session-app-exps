import { inject, singleton } from 'tsyringe';
import { env } from 'node:process';
import { Configuration, NodeEnvType } from '../../domain/types';
import ConfigurationRepository from '../../domain/repository/configuration.repository';
import Logger from '../../domain/logger';
import ConsoleLogger from '../logger/console.logger';

const className = 'EnvConfigurationRepository';

@singleton()
export default class EnvConfigurationRepository implements ConfigurationRepository {
    private _config: Configuration;

    constructor(@inject(ConsoleLogger) private _logger: Logger) {
        this._config = {
            nodeEnv: <NodeEnvType>env.NODE_ENV || 'live',
            server: {
                live: {
                    port: +(env.SERVER_LIVE_PORT || '3030'),
                    host: env.SERVER_LIVE_HOST || '127.0.0.1',
                },
                test: {
                    port: +(env.SERVER_TEST_PORT || '8080'),
                    host: env.SERVER_TEST_HOST || '127.0.0.1',
                },
            },
            mysql: {
                live: {
                    host: env.MYSQL_LIVE_HOST || 'localhost',
                    port: +(env.MYSQL_LIVE_PORT || '3306'),
                    user: env.MYSQL_LIVE_USER || 'root',
                    password: env.MYSQL_LIVE_PASSWORD || 'root',
                    database: env.MYSQL_LIVE_DATABASE || 'database',
                },
                test: {
                    host: env.MYSQL_TEST_HOST || 'localhost',
                    port: +(env.MYSQL_TEST_PORT || '3306'),
                    user: env.MYSQL_TEST_USER || 'root',
                    password: env.MYSQL_TEST_PASSWORD || 'root',
                    database: env.MYSQL_TEST_DATABASE || 'database',
                },
            },
        };
        this._logger.info({ className, object: this._config, message: 'EnvConfiguration created successfully' });
    }

    get(): Configuration {
        return this._config;
    }

    setEnv(env: NodeEnvType): void {
        this._config.nodeEnv = env;
    }
}
