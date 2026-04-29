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
      if (rankings?.length) setRankings(rankings);
    };

    socket.on("show_leaderboard", handleShowLeaderboard);
    socket.emit("get_leaderboard");

    return () => socket.off("show_leaderboard", handleShowLeaderboard);
  }, [socket]);

  if (!rankings) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5 text-center px-6">
          <span
            className="loading loading-dots loading-lg text-primary"
            style={{ width: 60 }}
          />
          <h2 className="text-2xl font-bold text-base-content">
            Memuat hasil...
          </h2>
        </div>
      </div>
    );
  }

  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3);

  // Reorder top3 for podium: [2nd, 1st, 3rd]
  const podium = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center gap-8 px-4 py-10 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-primary opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary opacity-10 blur-3xl -translate-x-1/3 translate-y-1/4 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-accent opacity-10 blur-3xl translate-x-1/3 translate-y-1/4 pointer-events-none" />

      {/* Header */}
      <div className="z-10 text-center flex flex-col items-center gap-2">
        <span className="text-5xl">🏆</span>
        <h1 className="text-5xl font-bold text-primary text-glow mt-1">
          Leaderboard
        </h1>
        <p className="text-base-content/50 text-sm">Hasil resmi pertandingan</p>
      </div>

      {/* Podium — top 3 */}
      {top3.length > 0 && (
        <div className="z-10 w-full max-w-2xl flex items-end justify-center gap-3 sm:gap-5">
          {podium.map((player) => (
            <PodiumSlot key={player.nickname} player={player} />
          ))}
        </div>
      )}

      {/* Rest of players */}
      {rest.length > 0 && (
        <div className="z-10 w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        className="z-10 btn btn-primary btn-lg gap-2 px-10 shadow-lg shadow-primary/30 hover:-translate-y-1 transition-all duration-200 mt-2"
      >
        🔄 Main Lagi
      </button>
    </div>
  );
}

function PodiumSlot({ player }) {
  if (!player) return <div className="flex-1" />;

  const configs = {
    1: {
      height: "h-40",
      badge: "🥇",
      glow: "shadow-warning/50 border-warning/60",
      medal: "bg-warning text-warning-content",
      order: "order-2",
    },
    2: {
      height: "h-28",
      badge: "🥈",
      glow: "shadow-base-content/20 border-base-content/20",
      medal: "bg-base-300 text-base-content",
      order: "order-1",
    },
    3: {
      height: "h-20",
      badge: "🥉",
      glow: "shadow-orange-500/20 border-orange-500/20",
      medal: "bg-orange-900/40 text-orange-300",
      order: "order-3",
    },
  };

  const c = configs[player.rank] || configs[3];
  const accuracy = player.total
    ? Math.round((player.score / player.total) * 100)
    : 0;

  return (
    <div className={`${c.order} flex-1 flex flex-col items-center gap-2`}>
      <span className="text-3xl">{c.badge}</span>
      <p className="font-bold text-base-content text-center text-sm sm:text-base truncate max-w-full px-2">
        {player.nickname}
      </p>
      <p className="text-xs text-base-content/50 font-mono">
        {player.score}pt · {accuracy}%
      </p>
      <div
        className={`w-full rounded-t-2xl border-2 ${c.height} ${c.glow} shadow-lg flex items-end justify-center pb-2 ${c.medal}`}
      >
        <span className="text-2xl font-black">#{player.rank}</span>
      </div>
    </div>
  );
}
