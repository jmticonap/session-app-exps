import { z } from 'zod';

export const UserRequestDtoSchema = z.object({
    firstname: z.string(),
    lastname: z.string(),
    age: z.number(),
    phone: z.string().optional(),
    dni: z.string(),
});

export type UserRequestDtoType = z.infer<typeof UserRequestDtoSchema>;
