import { z } from 'zod';

export const NewUserRequestDtoSchema = z.object({
    email: z.string().email(),
    username: z.string().min(3).optional(),
    password: z.string().min(6).max(15),
});

export type NewUserRequestDtoType = z.infer<typeof NewUserRequestDtoSchema>;
