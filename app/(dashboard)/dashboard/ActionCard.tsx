// components/dashboard/ActionCard.tsx
export function ActionCard({ title, description, buttonText, href, variant, icon }: any) {
  const isPrimary = variant === "primary";
  
  return (
    <div className={`relative overflow-hidden rounded-xl border p-6 transition-all hover:shadow-md ${isPrimary ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-bold text-xl">{title}</h3>
          </div>
          <p className={`text-sm ${isPrimary ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
            {description}
          </p>
        </div>
      </div>
      <a 
        href={href}
        className={`mt-6 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 
          ${isPrimary 
            ? 'bg-white text-black hover:bg-white/90' 
            : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
      >
        {buttonText}
      </a>
    </div>
  );
}