export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <h1 className="text-4xl font-bold text-bird mb-8">Hello Lingo!</h1>
      
      {/* Test a "Chunky" Button manually */}
      <button className="px-8 py-4 bg-bird text-white font-bold rounded-2xl border-b-4 border-green-700 active:border-b-0 active:translate-y-[2px] transition-all">
        START LEARNING
      </button>
    </main>
  );
}