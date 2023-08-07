import * as z from 'zod';

export const UserValidation = z.object({
  profile_photo: z.string().url().nonempty(),
  name: z
    .string()
    .min(3, { message: 'Name must be at least 3 characters.' })
    .max(30, { message: 'Name must be at most 30 characters.' }),
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters.' })
    .max(30, { message: 'Userame must be at most 30 characters.' }),
  bio: z.string().min(3).max(1000),
});
