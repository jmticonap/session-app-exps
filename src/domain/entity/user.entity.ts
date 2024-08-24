import { RowDataPacket } from 'mysql2/promise';
import BaseEntity from './base.entity';

export default interface UserEntity extends BaseEntity {
    email: string;
    username: string;
    password: string;
    salt: string;
}

export interface UserEntityPacket extends UserEntity, RowDataPacket {}
