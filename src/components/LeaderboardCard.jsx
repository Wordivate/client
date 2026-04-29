const rankConfig = {
  1: { emoji: "🥇", label: "Gold", cls: "border-warning/50 bg-warning/10" },
  2: {
    emoji: "🥈",
    label: "Silver",
    cls: "border-base-content/20 bg-base-300/30",
  },
  3: {
    emoji: "🥉",
    label: "Bronze",
    cls: "border-orange-500/30 bg-orange-900/10",
  },
};

export default function LeaderboardCard({
  rank,
  nickname,
  score,
  total,
  answers = [],
}) {
  const cfg = rankConfig[rank];
  const accuracy = total ? Math.round((score / total) * 100) : 0;
  const correct = answers.filter((a) => a.correct).length;

  return (
    <div
      className={`card bg-base-200 border ${cfg ? cfg.cls : "border-base-300"} shadow-lg hover:shadow-xl transition-shadow duration-200`}
    >
      <div className="card-body gap-3 p-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {cfg && <span className="text-xl">{cfg.emoji}</span>}
            <span className="badge badge-outline badge-primary font-mono text-xs">
              #{rank}
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-primary">{score}</span>
            <span className="text-base-content/40 text-xs ml-1">/ {total}</span>
          </div>
        </div>

        {/* Name */}
        <p className="font-bold text-base-content text-lg leading-tight truncate">
          {nickname}
        </p>

        {/* Stats */}
        <div className="flex gap-3">
          <div className="stat-badge">
            <span className="text-success text-xs font-bold">
              {correct} Benar
            </span>
          </div>
          <div className="stat-badge">
            <span className="text-base-content/50 text-xs font-bold">
              {accuracy}%
            </span>
          </div>
        </div>

        {/* Answer list */}
        {answers.length > 0 && (
          <div className="flex flex-col gap-1 mt-1">
            {answers.map((item) => (
              <div
                key={`${nickname}-${item.questionIndex}`}
                className="flex items-center justify-between bg-base-300/60 rounded-lg px-2.5 py-1.5 text-xs"
              >
                <span className="text-base-content/70 font-medium truncate flex-1 mr-2">
                  Q{item.questionIndex + 1}: {item.answer || "—"}
                </span>
                <span
                  className={`badge badge-xs font-bold ${
                    item.correct ? "badge-success" : "badge-error"
                  }`}
                >
                  {item.correct ? "✓" : "✗"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
