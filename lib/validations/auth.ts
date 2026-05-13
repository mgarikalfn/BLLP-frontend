import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("ኢሜይል ትክክል አይደለም (Invalid email)"),
  password: z.string().min(6, "ቢያንስ 6 ፊደላት (Min 6 characters)"),
});

const passwordValidation = z
  .string()
  .min(8, "ቢያንስ 8 ፊደላት (Min 8 characters)")
  .refine((password) => /[A-Z]/.test(password), {
    message: "ቢያንስ አንድ ትልቅ ፊደል (At least one uppercase letter)",
  })
  .refine((password) => /[a-z]/.test(password), {
    message: "ቢያንስ አንድ ትንሽ ፊደል (At least one lowercase letter)",
  })
  .refine((password) => /\d/.test(password), {
    message: "ቢያንስ አንድ ቁጥር (At least one number)",
  })
  .refine((password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), {
    message: "ቢያንስ አንድ ልዩ ምልክት (At least one special character)",
  });

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, "ቢያንስ 3 ፊደላት (Min 3 characters)")
    .max(20, "ቢበዛ 20 ፊደላት (Max 20 characters)")
    .refine((val) => !val.includes("@"), {
      message: "የተጠቃሚ ስም ኢሜይል መሆን የለበትም (Username cannot be an email)",
    }),
  email: z.string().email("ኢሜይል ትክክል አይደለም (Invalid email)"),
  password: passwordValidation,
  confirmPassword: z.string(),
  targetLanguage: z.enum(["AMHARIC", "OROMO"], { message: "ቋንቋ ይምረጡ (Select language)" }),
  proficiencyLevel: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"], { message: "የቋንቋ ደረጃ ይምረጡ (Select proficiency)" }),
  learningDirection: z.enum(["AM_TO_OR", "OR_TO_AM"], { message: "የመማር አቅጣጫ ይምረጡ (Select learning direction)" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "የይለፍ ቃል አይዛመድም (Passwords don't match)",
  path: ["confirmPassword"], // sets error to this field
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("ኢሜይል ትክክል አይደለም (Invalid email)"),
});

export const resetPasswordSchema = z.object({
  code: z.string().length(6, "6 አሃዝ ኮድ ያስገቡ (Enter 6-digit code)"),
  password: passwordValidation,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "የይለፍ ቃል አይዛመድም (Passwords don't match)",
  path: ["confirmPassword"],
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "የአሁኑን የይለፍ ቃል ያስገቡ (Enter current password)"),
  newPassword: passwordValidation,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "የይለፍ ቃል አይዛመድም (Passwords don't match)",
  path: ["confirmPassword"],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;