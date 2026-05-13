/**
 * Password strength validation utility
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */

export interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export type PasswordStrength = "weak" | "medium" | "strong";

export const checkPasswordRequirements = (password: string): PasswordRequirements => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
};

export const calculatePasswordStrength = (requirements: PasswordRequirements): PasswordStrength => {
  const metRequirements = Object.values(requirements).filter(Boolean).length;
  
  if (metRequirements <= 2) return "weak";
  if (metRequirements <= 3) return "medium";
  return "strong";
};

export const getMissingRequirements = (requirements: PasswordRequirements): string[] => {
  const missing: string[] = [];
  
  if (!requirements.minLength) missing.push("8+ characters");
  if (!requirements.hasUppercase) missing.push("uppercase letter");
  if (!requirements.hasLowercase) missing.push("lowercase letter");
  if (!requirements.hasNumber) missing.push("number");
  if (!requirements.hasSpecialChar) missing.push("special character");
  
  return missing;
};

export const getMissingRequirementsAmharic = (requirements: PasswordRequirements): string[] => {
  const missing: string[] = [];
  
  if (!requirements.minLength) missing.push("8+ ፊደላት");
  if (!requirements.hasUppercase) missing.push("ትልቅ ፊደል");
  if (!requirements.hasLowercase) missing.push("ትንሽ ፊደል");
  if (!requirements.hasNumber) missing.push("ቁጥር");
  if (!requirements.hasSpecialChar) missing.push("ልዩ ምልክት");
  
  return missing;
};

export const isPasswordValid = (requirements: PasswordRequirements): boolean => {
  return Object.values(requirements).every(Boolean);
};
