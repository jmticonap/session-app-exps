import MysqlCrudOperations from '../../infrastructure/db/mysql/mysql-crud-operations';
import { NewUserRequestDtoType } from '../dto/new-user-request.dto';
import UserEntity, { UserEntityPacket } from '../entity/user.entity';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export default interface UserRepository extends MysqlCrudOperations<UserEntity, UserEntityPacket> {
    register(user: NewUserRequestDtoType): Promise<Omit<UserEntity, 'password' | 'salt'>>;
}
