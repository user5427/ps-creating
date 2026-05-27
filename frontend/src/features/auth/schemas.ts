import { z } from "zod";

export const UserSchema = z.object({
    // backend uses UUIDs for user ids
    id: z.string(),
    email: z.string().email(),
    role: z.enum(["ATTENDEE", "ORGANIZER"]),
});

export const LoginResponseSchema = z.object({
    user: UserSchema,
    token: z.string(),
});

// optional but recommended
export type User = z.infer<typeof UserSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;