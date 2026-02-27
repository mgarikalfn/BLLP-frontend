import { cn } from "@/lib/utils"; // shadcn utility

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export function ChunkyButton({ variant = 'primary', className, ...props }: ButtonProps) {
  const variants = {
    primary: "bg-bird border-green-700",
    secondary: "bg-sky border-blue-600",
    danger: "bg-lava border-red-700",
  };

  return (
    <button 
      className={cn(
        "px-6 py-3 text-white font-bold rounded-xl border-b-4 transition-all active:border-b-0 active:translate-y-1",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}