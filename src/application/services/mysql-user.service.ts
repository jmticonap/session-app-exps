import { inject, injectable } from 'tsyringe';
import MysqlPoolConectionManager from '../../infrastructure/db/mysql/mysql-pool-conection-manager';
import ConectionManager from '../../infrastructure/db/conection-manager';
import MysqlExecutor from '../../infrastructure/db/mysql/mysql-executor';
import UserEntity from '../../domain/entity/user.entity';

const className = 'MysqlUserService';

@injectable()
export default class MysqlUserService {
    constructor(
        @inject(MysqlPoolConectionManager) private _poolConnection: ConectionManager,
        @inject(MysqlExecutor) private _executor: MysqlExecutor,
    ) {}

    async saveUserSaveTrasactionPointTest() {
        const method = this.saveUserSaveTrasactionPointTest.name;
        try {
            await this._poolConnection.getConnection();
            await this._poolConnection.beginTransaction();

            await this._poolConnection.savePoint('point1');

            const user1 = await this._executor.insert({
                tableName: 'user',
                data: {
                    firstname: 'firstname1',
                    lastname: 'lastname1',
                    age: 20,
                    phone: null,
                    dni: '65983475',
                } as UserEntity,
                className,
                method,
            });

            await this._poolConnection.savePoint('point2');

            const user2 = await this._executor.insert({
                tableName: 'user',
                data: {
                    firstname: 'firstname2',
                    lastname: 'lastname2',
                    age: 20,
                    phone: null,
                    dni: '65983476',
                } as UserEntity,
                className,
                method,
            });

            await this._poolConnection.rollback('point1');
            // await this._poolConnection.rollback();
            await this._poolConnection.commit();

            return [user1, user2];
        } catch (error) {
            throw error;
        }
    }
}
