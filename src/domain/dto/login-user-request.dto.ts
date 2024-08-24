import { z } from 'zod';

export const LoginUserRequestDtoSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(15),
});

export type LoginUserRequestDtoType = z.infer<typeof LoginUserRequestDtoSchema>;
