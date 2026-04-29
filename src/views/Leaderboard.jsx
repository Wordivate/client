import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import LeaderboardCard from "../components/LeaderboardCard";
import { useSocket } from "../context/SocketContext";

export default function Leaderboard() {
  const socket = useSocket();
  const navigate = useNavigate();
  const [rankings, setRankings] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleShowLeaderboard = ({ rankings }) => {
      if (rankings?.length) {
        setRankings(rankings);
      }
    };

    socket.on("show_leaderboard", handleShowLeaderboard);

    socket.emit("get_leaderboard");

    return () => {
      socket.off("show_leaderboard", handleShowLeaderboard);
    };
  }, [socket]);

  if (!rankings) {
    return (
      <div className="leaderboard-page">
        <header className="leaderboard-header">
          <h1 className="leaderboard-title">Leaderboard</h1>
          <p className="leaderboard-subtitle">Memuat hasil...</p>
        </header>
      </div>
    );
  }

  return (
    <div className="leaderboard-page">
      <header className="leaderboard-header">
        <h1 className="leaderboard-title">Leaderboard</h1>
        <p className="leaderboard-subtitle">Hasil resmi</p>
      </header>

      <section className="leaderboard-grid">
        {rankings.map((player) => (
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
