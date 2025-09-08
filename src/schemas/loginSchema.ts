import {z} from 'zod'

export const loginSchema = z.object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email format"),
    password: z
      .string()
      .min(1, "Password is required"),
    loginType: z.enum(["admin", "editor"]),
  });

  
  export type LoginSchemaType = z.infer<typeof loginSchema>;