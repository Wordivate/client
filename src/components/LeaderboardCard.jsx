const medalMap = {
  1: { label: "Gold", color: "#f4c95d", tag: "G" },
  2: { label: "Silver", color: "#c0c7d1", tag: "S" },
  3: { label: "Bronze", color: "#d08c60", tag: "B" },
};

export default function LeaderboardCard({
  rank,
  nickname,
  score,
  total,
  answers = [],
}) {
  const medal = medalMap[rank];
  const accuracy = total ? Math.round((score / total) * 100) : 0;

  return (
    <article className="leaderboard-card">
      <div className="card-top">
        <div className={`rank-badge ${medal ? "special" : ""} rank-${rank}`}>
          <span>#{rank}</span>
          {medal ? (
            <span aria-label={medal.label} title={medal.label}>
              {medal.tag}
            </span>
          ) : null}
        </div>
        <div className="score-line">
          <span className="score-value">{score}</span>
          <span className="score-meta">
            / {total} • {accuracy}%
          </span>
        </div>
      </div>

      <h2 className="player-name">{nickname}</h2>

      <div className="answer-list">
        {answers.map((item) => (
          <div
            className="answer-item"
            key={`${nickname}-${item.questionIndex}`}
          >
            <span className="answer-text">
              Q{item.questionIndex + 1}: {item.answer || "-"}
            </span>
            <span
              className={`answer-status ${item.correct ? "correct" : "wrong"}`}
            >
              {item.correct ? "Benar" : "Salah"}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}
