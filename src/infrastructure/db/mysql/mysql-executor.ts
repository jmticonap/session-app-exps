import { inject, singleton } from 'tsyringe';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import MysqlPoolConectionManager from './mysql-pool-conection-manager';
import BaseEntity from '../../../domain/entity/base.entity';
import Logger from '../../../domain/logger';
import ConsoleLogger from '../../logger/console.logger';

type QueryAttributes = {
    sql: string;
    params?: any[];
    className: string;
    method: string;
};

type InsertAttributes<T> = {
    tableName: string;
    data: T;
    className: string;
    method: string;
};

@singleton()
export default class MysqlExecutor {
    constructor(
        @inject(ConsoleLogger) private _logger: Logger,
        @inject(MysqlPoolConectionManager) private _poolManager: MysqlPoolConectionManager,
    ) {}

    async query<E extends BaseEntity, T extends E & RowDataPacket>({
        sql,
        params,
        className,
        method,
    }: QueryAttributes): Promise<E[]> {
        try {
            const conn = await this._poolManager.getConnection();
            this._logger.info({ className, method, object: { sql, params } });

            const [result] = await conn.query<T[]>(sql, params);

            return <E[]>(<unknown>result);
        } catch (error) {
            this._logger.error({ className, method, error: <Error>error });
            throw error;
        }
    }

    async insert<E extends BaseEntity>({ tableName, data, className, method }: InsertAttributes<E>): Promise<E> {
        try {
            const conn = await this._poolManager.getConnection();
            this._logger.info({ className, method, object: { data } });

            let sql = `INSERT INTO ${tableName} `;
            sql += `(${this.makeFieldList(data)}) `;
            sql += `VALUES (${this.makeQuestionMarkParam(data)});`;

            const params = this.makeParamsArray(data);

            this._logger.info({ object: { sql, params }, message: 'SQL' });

            const [{ insertId }] = await conn.query<ResultSetHeader>(sql, params);
            data.id = insertId;

            return data;
        } catch (error) {
            this._logger.error({ className, method, error: <Error>error });
            throw error;
        }
    }

    async update<E extends BaseEntity>({ tableName, data, className, method }: InsertAttributes<E>): Promise<E> {
        try {
            const conn = await this._poolManager.getConnection();
            this._logger.info({ className, method, object: { data } });

            let sql = `UPDATE ${tableName} SET `;
            sql += ` ${this.makeKeyValueList(data)} `;
            sql += 'WHERE id = :id;';

            await conn.query(sql, data);

            return data;
        } catch (error) {
            this._logger.error({ className, method, error: <Error>error });
            throw error;
        }
    }

    private makeFieldList<T>(data: T): string {
        return Object.keys(data as object)
            .map<string>((key) => key)
            .join(', ');
    }

    private makeQuestionMarkParam<T>(data: T): string {
        return Object.keys(data as object)
            .map<string>(() => '?')
            .join(', ');
    }

    private makeKeyValueList<T>(data: T): string {
        return Object.keys(data as object)
            .map((key) => `${key} = :${key}`)
            .join(', ');
    }

    private makeParamsArray<T>(data: T): any[] {
        return Object.entries(data as object).map<any>(([, value]) => value);
    }
}
