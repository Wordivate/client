import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import LeaderboardCard from "../components/LeaderboardCard";
import { useSocket } from "../context/SocketContext";
import "./Leaderboard.css";

export default function Leaderboard() {
  const socket = useSocket();
  const navigate = useNavigate();
  const [rankings, setRankings] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleShowLeaderboard = ({ rankings }) => {
      if (rankings?.length) setRankings(rankings);
    };

    socket.on("show_leaderboard", handleShowLeaderboard);
    socket.emit("get_leaderboard");

    return () => socket.off("show_leaderboard", handleShowLeaderboard);
  }, [socket]);

  if (!rankings) {
    return (
      <div className="lb-full-screen">
        <div className="lb-centered">
          <span className="loading-dots lb-spinner-primary"></span>
          <h2 className="lb-title">Memuat hasil...</h2>
        </div>
      </div>
    );
  }

  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3);
  const podium = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="lb-container">
      {/* Background effects */}
      <div className="blob lb-blob-top" />
      <div className="blob lb-blob-bottom-left" />
      <div className="blob lb-blob-bottom-right" />

      {/* Header */}
      <div className="lb-header">
        <span className="lb-emoji-large">🏆</span>
        <h1 className="title-glow-primary lb-main-title">Leaderboard</h1>
        <p className="lb-subtitle">Hasil resmi pertandingan</p>
      </div>

      {/* Podium — top 3 */}
      {top3.length > 0 && (
        <div className="podium-wrapper">
          {podium.map((player) => (
            <PodiumSlot key={player.nickname} player={player} />
          ))}
        </div>
      )}

      {/* Rest of players */}
      {rest.length > 0 && (
        <div className="lb-grid">
          {rest.map((player) => (
            <LeaderboardCard
              key={`${player.nickname}-${player.rank}`}
              {...player}
            />
          ))}
        </div>
      )}

      {/* Play again */}
      <button
        onClick={() => navigate("/")}
        className="btn-game btn-game-primary lb-btn-play-again"
      >
        🔄 Main Lagi
      </button>
    </div>
  );
}

function PodiumSlot({ player }) {
  if (!player) return <div className="podium-empty" />;

  const configs = {
    1: { badge: "🥇", rankClass: "podium-1", order: "order-2" },
    2: { badge: "🥈", rankClass: "podium-2", order: "order-1" },
    3: { badge: "🥉", rankClass: "podium-3", order: "order-3" },
  };

  const c = configs[player.rank] || configs[3];
  const accuracy = player.total
    ? Math.round((player.score / player.total) * 100)
    : 0;

  return (
    <div className={`podium-slot ${c.order}`}>
      <span className="podium-badge">{c.badge}</span>
      <p className="podium-name">{player.nickname}</p>
      <p className="podium-stats">
        {player.score}pt · {accuracy}%
      </p>
      <div className={`podium-bar ${c.rankClass}`}>
        <span className="podium-rank-text">#{player.rank}</span>
      </div>
    </div>
  );
}
