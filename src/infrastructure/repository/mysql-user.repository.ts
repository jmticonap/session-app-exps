import { Lifecycle, inject, scoped } from 'tsyringe';
import UserEntity, { UserEntityPacket } from '../../domain/entity/user.entity';
import UserRepository from '../../domain/repository/user.repository';
import ConsoleLogger from '../logger/console.logger';
import Logger from '../../domain/logger';
import MysqlCrudOperations from '../db/mysql/mysql-crud-operations';
import MysqlExecutor from '../db/mysql/mysql-executor';

const className = 'MysqlUserService';

@scoped(Lifecycle.ResolutionScoped)
export default class MysqlUserRepository
    extends MysqlCrudOperations<UserEntity, UserEntityPacket>
    implements UserRepository
{
    constructor(@inject(ConsoleLogger) logger: Logger, @inject(MysqlExecutor) executor: MysqlExecutor) {
        super(className, logger, executor, 'user');
    }
}
