import z from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(3, "Full name is too short"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.email("Email is required"),
  password: z.string().min(1, "Password is required"),
});
