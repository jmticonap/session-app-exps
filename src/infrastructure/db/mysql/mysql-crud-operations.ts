import { RowDataPacket } from 'mysql2/promise';
import MysqlExecutor from './mysql-executor';
import CrudOperations from '../crud-operations';
import BaseEntity from '../../../domain/entity/base.entity';
import Logger from '../../../domain/logger';

export default abstract class MysqlCrudOperations<E extends BaseEntity, P extends E & RowDataPacket>
    implements CrudOperations<E, P>
{
    constructor(
        private className: string,
        protected _logger: Logger,
        protected _executor: MysqlExecutor,
        protected tableName: string,
    ) {}

    async findAll(): Promise<E[]> {
        const method = this.findAll.name;
        try {
            const sql = `SELECT * FROM ${this.tableName};`;

            const result = await this._executor.query<E, P>({ sql, className: this.className, method });

            return result;
        } catch (error) {
            this._logger.error({ className: this.className, method, error: <Error>error });
            throw error;
        }
    }

    async findById(id: number): Promise<E> {
        const method = this.findById.name;
        try {
            const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;

            const result = await this._executor.query<E, P>({ sql, params: [id], className: this.className, method });

            return result[0];
        } catch (error) {
            this._logger.error({ className: this.className, method, error: <Error>error });
            throw error;
        }
    }

    async insert(entity: E): Promise<E> {
        const method = this.insert.name;
        try {
            return await this._executor.insert({
                tableName: this.tableName,
                data: entity,
                className: this.className,
                method,
            });
        } catch (error) {
            this._logger.error({ className: this.className, method, error: <Error>error });
            throw error;
        }
    }

    async update(entity: E): Promise<E> {
        const method = this.insert.name;
        try {
            return await this._executor.update({
                tableName: this.tableName,
                data: entity,
                className: this.className,
                method,
            });
        } catch (error) {
            this._logger.error({ className: this.className, method, error: <Error>error });
            throw error;
        }
    }
}
