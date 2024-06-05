import { RowDataPacket } from 'mysql2/promise';
import BaseEntity from './base.entity';

export default interface UserEntity extends BaseEntity {
    firstname: string;
    lastname: string | null;
    age: number | null;
    phone: string | null;
    dni: string;
}

export interface UserEntityPacket extends UserEntity, RowDataPacket {}
