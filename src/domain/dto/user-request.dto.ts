import { z } from 'zod';

export const UserRequestDtoSchema = z.object({
    firstname: z.string().min(5).max(150),
    lastname: z.string().min(5).max(150),
    age: z.number().min(0),
    phone: z.string().min(9).optional(),
    dni: z.string().min(8),
});

export type UserRequestDtoType = z.infer<typeof UserRequestDtoSchema>;
