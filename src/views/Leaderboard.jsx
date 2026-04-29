import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import LeaderboardCard from "../components/LeaderboardCard";
import { useSocket } from "../context/SocketContext";

const mockRankings = [
  {
    rank: 1,
    nickname: "Ahmad",
    score: 8,
    total: 10,
    answers: [
      { questionIndex: 0, answer: "jakarta", correct: true },
      { questionIndex: 1, answer: "lima", correct: false },
    ],
  },
  {
    rank: 2,
    nickname: "Reza",
    score: 6,
    total: 10,
    answers: [
      { questionIndex: 0, answer: "bogor", correct: false },
      { questionIndex: 1, answer: "dua", correct: false },
    ],
  },
];

export default function Leaderboard() {
  const socket = useSocket();
  const navigate = useNavigate();
  const [rankings, setRankings] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleShowLeaderboard = (payload) => {
      if (payload?.rankings?.length) {
        setRankings(payload.rankings);
        setLastUpdated(new Date());
      }
    };

    socket.on("show_leaderboard", handleShowLeaderboard);

    return () => {
      socket.off("show_leaderboard", handleShowLeaderboard);
    };
  }, [socket]);

  const data = useMemo(() => {
    if (rankings?.length) return rankings;
    return mockRankings;
  }, [rankings]);

  return (
    <div className="leaderboard-page">
      <header className="leaderboard-header">
        <h1 className="leaderboard-title">Leaderboard</h1>
        <p className="leaderboard-subtitle">
          {rankings?.length
            ? "Hasil resmi dari host"
            : "Preview data mock (menunggu host)"}
          {lastUpdated ? ` - ${lastUpdated.toLocaleTimeString()}` : ""}
        </p>
      </header>

      <section className="leaderboard-grid">
        {data.map((player) => (
          <LeaderboardCard
            key={`${player.nickname}-${player.rank}`}
            {...player}
          />
        ))}
      </section>

      <div className="leaderboard-actions">
        <button className="leaderboard-button" onClick={() => navigate("/")}>
          Main Lagi
        </button>
      </div>
    </div>
  );
}
