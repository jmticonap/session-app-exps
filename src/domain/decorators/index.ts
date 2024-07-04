import { z } from 'zod';
import { HttpRequest, HttpResponse } from '../types/route';
import { HTTP_STATUS } from '../constants';

export function validationSchemaBody(schema: z.AnyZodObject) {
    return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalFn = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            const param: HttpRequest = args[0];
            const isValid = schema.safeParse(param.body);
            if (!isValid.success) {
                console.dir(isValid.error, { depth: null, color: true });
                // throw isValid.error;
                return <HttpResponse>{
                    statusCode: HTTP_STATUS.BAD_REQUEST,
                    body: JSON.parse(isValid.error.message),
                };
            }
            console.log('Validation successfully');
            return originalFn.apply(this, args);
        };

        return descriptor;
    };
}
