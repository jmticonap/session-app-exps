import { singleton } from 'tsyringe';
import Logger from '../logger';
import { LoggerAttributeType } from '../../../domain/types';

@singleton()
export default class ConsoleLogger implements Logger {
    info({ className, method, execTime, message, object }: LoggerAttributeType): void {
        const d = new Date();
        try {
            console.log(`[${d.toISOString()}]:`);
            console.dir(
                this.takeOffUndefinedProperties({
                    level: 'INFO',
                    className,
                    method,
                    execTime,
                    message,
                    object,
                }),
                { depth: null, colors: true },
            );
        } catch (error) {
            console.error(error);
        }
    }

    debug({ className, method, execTime, message, object }: LoggerAttributeType): void {
        const d = new Date();
        console.log(`[${d.toISOString()}]:`);
        console.dir(
            this.takeOffUndefinedProperties({
                level: 'DEBUG',
                className,
                method,
                execTime,
                message,
                object,
            }),
            { depth: null, colors: true },
        );
    }

    warn({ className, method, execTime, message, object }: LoggerAttributeType): void {
        const d = new Date();
        console.log(`[${d.toISOString()}]:`);
        console.dir(
            this.takeOffUndefinedProperties({
                level: 'WARN',
                className,
                method,
                execTime,
                message,
                object,
            }),
            { depth: null, colors: true },
        );
    }

    error({ className, method, execTime, message, object, error }: LoggerAttributeType): void {
        const d = new Date();
        console.log(`[${d.toISOString()}]:`);
        console.dir(
            this.takeOffUndefinedProperties({
                level: 'ERROR',
                className,
                method,
                execTime,
                message,
                object: JSON.stringify(object, null, 2),
                error,
            }),
            { depth: null, colors: true },
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
