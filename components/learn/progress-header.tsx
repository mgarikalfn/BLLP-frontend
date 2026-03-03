export const ProgressHeader = ({ current, total }: { current: number, total: number }) => {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full pt-4 flex items-center gap-x-4">
      <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-sky-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-slate-400 font-bold font-mono">
        {current} / {total}
      </span>
    </div>
  );
};