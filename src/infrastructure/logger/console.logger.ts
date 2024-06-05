import Logger from '../../domain/logger';
import { LoggerAttributeType } from '../../domain/types';

export default class ConsoleLogger implements Logger {
    info({ className, method, execTime, message, object }: LoggerAttributeType): void {
        const d = new Date();
        try {
            console.info(
                `[${d.toISOString()}]:\n`,
                this.takeOffUndefinedProperties({
                    level: 'INFO',
                    className,
                    method,
                    execTime,
                    message,
                    object: JSON.stringify(object),
                }),
            );
        } catch (error) {
            console.error(error);
        }
    }
    debug({ className, method, execTime, message, object }: LoggerAttributeType): void {
        const d = new Date();
        console.debug(
            `[${d.toISOString()}]:\n`,
            this.takeOffUndefinedProperties({
                level: 'DEBUG',
                className,
                method,
                execTime,
                message,
                object: JSON.stringify(object),
            }),
        );
    }
    warn({ className, method, execTime, message, object }: LoggerAttributeType): void {
        const d = new Date();
        console.warn(
            `[${d.toISOString()}]:\n`,
            this.takeOffUndefinedProperties({
                level: 'WARN',
                className,
                method,
                execTime,
                message,
                object: JSON.stringify(object),
            }),
        );
    }
    error({ className, method, execTime, message, object, error }: LoggerAttributeType): void {
        const d = new Date();
        console.error(
            `[${d.toISOString()}]:\n`,
            this.takeOffUndefinedProperties({
                level: 'ERROR',
                className,
                method,
                execTime,
                message,
                object: JSON.stringify(object),
                error,
            }),
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private takeOffUndefinedProperties(obj: { [key: string]: any }): object {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: { [key: string]: any } = {};
        for (const key of Object.keys(obj)) {
            if (obj[key]) result[key] = obj[key];
        }

        return result;
    }
}
