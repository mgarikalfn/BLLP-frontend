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
  targetLanguage: z.enum(["AMHARIC", "OROMO"], { message: "ቋንቋ ይምረጡ (Select language)" }),
  proficiencyLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"], { message: "የቋንቋ ደረጃ ይምረጡ (Select proficiency)" }),
  learningDirection: z.enum(["AM_TO_OR", "OR_TO_AM"], { message: "የመማር አቅጣጫ ይምረጡ (Select learning direction)" }),
  avatarUrl: z
    .string()
    .trim()
    .url("አድራሻ ትክክል አይደለም (Invalid URL)")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .max(280, "ባዮ ከ280 ፊደላት መብለጥ አይችልም (Bio must be 280 characters or less)")
    .optional()
    .or(z.literal("")),
}).refine((data) => data.password === data.confirmPassword, {
  message: "የይለፍ ቃል አይዛመድም (Passwords don't match)",
  path: ["confirmPassword"], // sets error to this field
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;