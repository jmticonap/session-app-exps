import crypto from 'node:crypto';
import { inject, singleton } from 'tsyringe';
import UserEntity, { UserEntityPacket } from '../../domain/entity/user.entity';
import UserRepository from '../../domain/repository/user.repository';
import ConsoleLogger from '../logger/console/console.logger';
import Logger from '../logger/logger';
import MysqlCrudOperations from '../db/mysql/mysql-crud-operations';
import MysqlExecutor from '../db/mysql/mysql-executor';
import { NewUserRequestDtoType } from '../../domain/dto/new-user-request.dto';

const className = 'MysqlUserRepository';

@singleton()
export default class MysqlUserRepository
    extends MysqlCrudOperations<UserEntity, UserEntityPacket>
    implements UserRepository
{
    constructor(@inject(ConsoleLogger) logger: Logger, @inject(MysqlExecutor) executor: MysqlExecutor) {
        super(className, logger, executor, 'user');
        logger.info({ className, message: 'created successfully' });
    }

    async register(user: NewUserRequestDtoType): Promise<Omit<UserEntity, 'password' | 'salt'>> {
        const method = this.register.name;
        try {
            const salt = crypto.randomBytes(16).toString('hex');
            const hash = crypto.pbkdf2Sync(user.password, salt, 1000, 64, 'sha512').toString('hex');

            const data: UserEntity = {
                email: user.email,
                username: user.username || user.email.split('@')[0],
                password: hash,
                salt,
            };

            const result: UserEntity = <UserEntity>await this._executor.insert<UserEntity>({
                tableName: this.tableName,
                data,
                className,
                method,
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, salt: _, ...rest } = result;

            return rest;
        } catch (error) {
            this._logger.warn({ className, method, error: <Error>error });

            throw error;
        }
    }
}
