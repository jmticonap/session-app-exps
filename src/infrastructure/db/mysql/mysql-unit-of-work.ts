import { Connection, PoolConnection } from 'mysql2/promise';
import UnitOfWork from '../unit-of-work';
import { SessionError } from '../../../domain/errors';
import { HTTP_STATUS } from '../../../domain/constants';
import Logger from '../../logger/logger';

export default abstract class MysqlUnitOfWork implements UnitOfWork {
    protected _poolConnection?: PoolConnection | Connection | undefined;

    constructor(
        private className: string,
        protected _logger: Logger,
    ) {}

    async beginTransaction(): Promise<void> {
        const method = this.beginTransaction.name;
        try {
            if (!this._poolConnection)
                throw new SessionError('PoolConnection is undefined', HTTP_STATUS.INTERNAL_SERVER_ERROR, 'ERROR');

            await this._poolConnection.query('START TRANSACTION;');
        } catch (error) {
            this._logger.warn({ className: this.className, method, error: <Error>error });
            throw error;
        }
    }

    async savePoint(pointName: string): Promise<void> {
        const method = this.savePoint.name;
        try {
            if (!pointName) throw new SessionError('Point namr is empty', HTTP_STATUS.INTERNAL_SERVER_ERROR, 'WARN');
            if (!this._poolConnection)
                throw new SessionError('PoolConnection is undefined', HTTP_STATUS.INTERNAL_SERVER_ERROR, 'ERROR');

            await this._poolConnection.query(`SAVEPOINT ${pointName};`);
        } catch (error) {
            this._logger.warn({ className: this.className, method, error: <Error>error });
            throw error;
        }
    }

    async commit(): Promise<void> {
        const method = this.commit.name;
        try {
            if (!this._poolConnection)
                throw new SessionError('PoolConnection is undefined', HTTP_STATUS.INTERNAL_SERVER_ERROR, 'ERROR');

            await this._poolConnection.query('COMMIT;');
        } catch (error) {
            this._logger.warn({ className: this.className, method, error: <Error>error });
            throw error;
        }
    }

    rollback(): Promise<void>;
    rollback(pointName: string): Promise<void>;
    async rollback(pointName?: string): Promise<void> {
        const method = this.rollback.name;
        try {
            if (!this._poolConnection)
                throw new SessionError('PoolConnection is undefined', HTTP_STATUS.INTERNAL_SERVER_ERROR, 'ERROR');

            await this._poolConnection.query(pointName ? `ROLLBACK TO ${pointName}` : 'ROLLBACK');
        } catch (error) {
            this._logger.warn({ className: this.className, method, error: <Error>error });
            throw error;
        }
    }
}
