import { z } from 'zod';
import { HttpRequest } from '../types/route';

export function validationSchemaBody(schema: z.AnyZodObject) {
    return function (target: object, propertyKey: string, descriptor: any) {
        descriptor.value = function (req: HttpRequest) {
            const isValid = schema.safeParse(req.body);
            if (!isValid.success) throw isValid.error;
            console.log('Validation successfully');
        };

        return descriptor;
    };
}
