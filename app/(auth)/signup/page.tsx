import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-700 text-center">መገለጫ ይፍጠሩ (Create Profile)</h2>
      <AuthForm type="signup" />
    </div>
  );
}