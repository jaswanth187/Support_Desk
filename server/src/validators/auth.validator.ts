import {z} from "zod";

const passwordSchema = z
    .string()
    .min(8,"Password msut contain at least 8 characters")
    .max(72, "Password cannot exceed 72 characters")
    .refine((value)=>Buffer.byteLength(value,"utf-8") <= 72,"Password is too long");

export const registerSchema = z.object({
    name: z
    .string()
    .trim()
    .min(2,"Name must contain at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),

    email: z
    .string()
    .trim()
    .email("Please provide a valid email")
    .max(254)
    .transform(value=> value.toLowerCase()),

    password: passwordSchema
})

export type RegisterInput = z.infer<typeof registerSchema>

export const updateProfileSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must contain at least 2 characters")
        .max(50, "Name cannot exceed 50 characters")
        .optional(),
    email: z
        .string()
        .trim()
        .email("Please provide a valid email")
        .max(254)
        .transform(value => value.toLowerCase())
        .optional(),
}).refine(
    (profile) => profile.name !== undefined || profile.email !== undefined,
    "At least one profile field is required"
);

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
    currentPassword: z
        .string()
        .min(1, "Current password is required")
        .max(72, "Current password cannot exceed 72 characters")
        .refine(
            (value) => Buffer.byteLength(value, "utf-8") <= 72,
            "Current password is too long"
        ),
    newPassword: passwordSchema,
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;