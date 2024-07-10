import { RowDataPacket } from 'mysql2/promise';
import MysqlExecutor from './mysql-executor';
import CrudOperations from '../crud-operations';
import BaseEntity from '../../../domain/entity/base.entity';
import Logger from '../../logger/logger';
import { PaginationParams, ResponsePage } from '../../../domain/types';
import { SessionError } from '../../../domain/errors';
import { HTTP_STATUS } from '../../../domain/constants';

export default abstract class MysqlCrudOperations<E extends BaseEntity, P extends E & RowDataPacket>
    implements CrudOperations<E, P>
{
    constructor(
        private className: string,
        protected _logger: Logger,
        protected _executor: MysqlExecutor,
        protected tableName: string,
    ) {}

    async findAll(pagParams: PaginationParams): Promise<ResponsePage<E>> {
        const method = this.findAll.name;
        try {
            const init = (pagParams.page - 1) * pagParams.limit;
            const limit = pagParams.limit;
            if (init < 0 || limit < 1)
                throw new SessionError('Parameters can not less than zero', HTTP_STATUS.BAD_REQUEST, 'WARN');

            const sql = `
                SELECT COUNT(*) as count FROM ${this.tableName};
                SELECT * FROM ${this.tableName} LIMIT ${init}, ${limit};
            `;

            const [[count], result] = await this._executor.queryMultiple({ sql, className: this.className, method });

            return {
                data: result as E[],
                count: count.count,
                pages: Math.ceil(count.count / limit),
                limit,
                current: pagParams.page,
            };
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
