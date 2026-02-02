import { z } from "zod";

export const updateRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["USER", "EDITOR", "ADMIN"]),
});

export const blockUserSchema = z.object({
  userId: z.string().min(1),
});

export const resetPasswordSchema = z.object({
  userId: z.string().min(1),
  newPassword: z.string().min(8),
});
