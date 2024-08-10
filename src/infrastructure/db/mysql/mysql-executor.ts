import { inject, singleton } from 'tsyringe';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import MysqlPoolConectionManager from './mysql-pool-conection-manager';
import ConectionManager from '../conection-manager';
import BaseEntity from '../../../domain/entity/base.entity';
import Logger from '../../logger/logger';
import ConsoleLogger from '../../logger/console/console.logger';
import { SessionError } from '../../../domain/errors';

type QueryAttributes = {
    sql: string;
    params?: any[];
    className: string;
    method: string;
};

type InsertAttributes<T> = {
    tableName: string;
    data: T | T[];
    className: string;
    method: string;
};

@singleton()
export default class MysqlExecutor {
    constructor(
        @inject(ConsoleLogger) private _logger: Logger,
        @inject(MysqlPoolConectionManager) private _poolManager: ConectionManager,
    ) {}

    public setConectionManager(conectionManager: ConectionManager): void {
        this._poolManager = conectionManager;
    }

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

    async queryMultiple({ sql, params, className, method }: QueryAttributes): Promise<RowDataPacket[][]> {
        try {
            const conn = await this._poolManager.getConnection();

            this._logger.info({ className, method, object: { sql, params } });

            const [result] = await conn.query<RowDataPacket[][]>(sql, params);

            return result;
        } catch (error) {
            this._logger.error({ className, method, error: <Error>error });

            throw error;
        }
    }

    async insert<E extends BaseEntity>({ tableName, data, className, method }: InsertAttributes<E>): Promise<E | E[]> {
        try {
            const conn = await this._poolManager.getConnection();

            this._logger.info({ className, method, object: { data } });

            let sql = `INSERT INTO ${tableName} `;
            sql += `(${this.makeFieldList(Array.isArray(data) ? data[0] : data)}) `;
            sql += `VALUES ${this.makeQuestionMarkParam(data)};`;

            const params = this.makeParamsArray(data);

            this._logger.info({ object: { sql, params }, message: 'SQL' });

            const [{ insertId, affectedRows }] = await conn.query<ResultSetHeader>(sql, params);
            if (Array.isArray(data)) {
                for (let i = 0; i < affectedRows; i++) {
                    data[i].id = insertId + i;
                }
            } else {
                data.id = insertId;
            }

            return data;
        } catch (error) {
            this._logger.error({ className, method, error: <Error>error });

            throw error;
        }
    }

    async update<E extends BaseEntity>({ tableName, data, className, method }: InsertAttributes<E>): Promise<E> {
        try {
            if (Array.isArray(data)) throw new SessionError('Data can not be array');
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

    private makeQuestionMarkParam(data: any): string {
        if (Array.isArray(data)) {
            const result: string[] = [];
            for (const s of data) {
                const row = Object.keys(s as object)
                    .map<string>(() => '?')
                    .join(', ');
                result.push(`(${row})`);
            }

            return result.join(', ');
        } else {
            const result = Object.keys(data as object)
                .map<string>(() => '?')
                .join(', ');

            return `(${result})`;
        }
    }

    private makeKeyValueList<T>(data: T): string {
        return Object.keys(data as object)
            .map((key) => `${key} = :${key}`)
            .join(', ');
    }

    private makeParamsArray<T>(data: T): any[] {
        if (Array.isArray(data)) {
            return data.map((obj) => Object.values(obj as object)).flat();
        } else {
            return Object.values(data as object);
        }
    }
}
