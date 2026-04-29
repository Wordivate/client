import "../index.css";

const rankConfig = {
  1: { emoji: "🥇", label: "Gold", cls: "card-gold" },
  2: { emoji: "🥈", label: "Silver", cls: "card-silver" },
  3: { emoji: "🥉", label: "Bronze", cls: "card-bronze" },
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
    <div className={`lb-card ${cfg ? cfg.cls : "card-default"}`}>
      <div className="lb-card-body">
        {/* Header row */}
        <div className="lb-card-header">
          <div className="lb-rank-info">
            {cfg && <span className="lb-emoji-small">{cfg.emoji}</span>}
            <span className="badge-outline-small">#{rank}</span>
          </div>
          <div className="lb-score-info">
            <span className="lb-score-text">{score}</span>
            <span className="lb-total-text">/ {total}</span>
          </div>
        </div>

        {/* Name */}
        <p className="lb-nickname">{nickname}</p>

        {/* Stats */}
        <div className="lb-stats-row">
          <div className="stat-badge text-success">{correct} Benar</div>
          <div className="stat-badge text-muted">{accuracy}%</div>
        </div>

        {/* Answer list */}
        {answers.length > 0 && (
          <div className="lb-answers-list">
            {answers.map((item) => (
              <div
                key={`${nickname}-${item.questionIndex}`}
                className="lb-answer-item"
              >
                <span className="lb-answer-text">
                  Q{item.questionIndex + 1}: {item.answer || "—"}
                </span>
                <span
                  className={`badge-indicator ${item.correct ? "indicator-success" : "indicator-error"}`}
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
