import { LoggerAttributeType } from '../types';

export default interface Logger {
    info({ className, method, execTime, message, object }: LoggerAttributeType): void;
    debug({ className, method, execTime, message, object }: LoggerAttributeType): void;
    warn({ className, method, execTime, message, object }: LoggerAttributeType): void;
    error({ className, method, execTime, message, object, error }: LoggerAttributeType): void;
}
