import { RowDataPacket } from 'mysql2/promise';
import BaseEntity from '../../domain/entity/base.entity';
import { PaginationParams, ResponsePage } from '../../domain/types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default interface CrudOperations<E extends BaseEntity, P extends E & RowDataPacket> {
    findAll(pagParams: PaginationParams): Promise<ResponsePage<E>>;

    findById(id: number): Promise<E>;

    insert(entity: E): Promise<E>;

    update(entity: E): Promise<E>;
}
