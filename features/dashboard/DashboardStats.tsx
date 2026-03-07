interface Props {
  xp: number;
  streak: number;
  level: number;
}

export default function DashboardStats({ xp, streak, level }: Props) {

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">

      <div className="bg-white p-4 rounded shadow">
        <p className="text-sm text-gray-500">XP</p>
        <h2 className="text-2xl font-bold">{xp}</h2>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <p className="text-sm text-gray-500">Streak</p>
        <h2 className="text-2xl font-bold">🔥 {streak}</h2>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <p className="text-sm text-gray-500">Level</p>
        <h2 className="text-2xl font-bold">🏆 {level}</h2>
      </div>

    </div>
  );
}