import MysqlCrudOperations from '../../infrastructure/db/mysql/mysql-crud-operations';
import UserEntity, { UserEntityPacket } from '../entity/user.entity';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export default interface UserRepository extends MysqlCrudOperations<UserEntity, UserEntityPacket> {}
