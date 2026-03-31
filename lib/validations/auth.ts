import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("ኢሜይል ትክክል አይደለም (Invalid email)"),
  password: z.string().min(6, "ቢያንስ 6 ፊደላት (Min 6 characters)"),
});

export const signupSchema = z.object({
  username: z.string().min(3, "ቢያንስ 3 ፊደላት (Min 3 characters)"),
  email: z.string().email("ኢሜይል ትክክል አይደለም (Invalid email)"),
  password: z.string().min(6, "ቢያንስ 6 ፊደላት (Min 6 characters)"),
  confirmPassword: z.string(),
  targetLang: z.enum(["AMHARIC", "OROMO"], { message: "ቋንቋ ይምረጡ (Select language)" }),
  proficiency: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"], { message: "የቋንቋ ደረጃ ይምረጡ (Select proficiency)" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "የይለፍ ቃል አይዛመድም (Passwords don't match)",
  path: ["confirmPassword"], // sets error to this field
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;