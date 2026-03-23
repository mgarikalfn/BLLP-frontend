export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex flex-col items-center gap-y-2">
        <img src="/mascot.svg" alt="Mascot" className="w-20 h-20" />
        <h1 className="text-3xl font-black text-green-600 tracking-wide">Lingo</h1>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}