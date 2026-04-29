import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSocket } from "../context/SocketContext";

export default function PlayerJoin() {
  const socket = useSocket();
  const navigate = useNavigate();

  const [roomCode, setRoomCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleJoinError = ({ message }) => {
      setErrorMsg(message);
      setJoined(false);
    };
    const handlePlayerJoined = ({ players }) => setPlayers(players);
    const handleGameStarted = () => navigate("/play/game");

    socket.on("join_error", handleJoinError);
    socket.on("player_joined", handlePlayerJoined);
    socket.on("game_started", handleGameStarted);

    return () => {
      socket.off("join_error", handleJoinError);
      socket.off("player_joined", handlePlayerJoined);
      socket.off("game_started", handleGameStarted);
    };
  }, [socket, navigate]);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomCode || !nickname) return;
    setErrorMsg("");
    socket.emit("join_room", { roomCode: roomCode.toUpperCase(), nickname });
    setJoined(true);
  };

  if (joined && !errorMsg) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-secondary opacity-10 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="z-10 w-full max-w-sm flex flex-col gap-5 text-center">
          {/* Waiting state */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <span
                className="loading loading-ring loading-lg text-secondary"
                style={{ width: 72, height: 72 }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-2xl">
                🎮
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-base-content">
                Menunggu Host...
              </h2>
              <p className="text-base-content/50 text-sm mt-1">
                Game akan segera dimulai
              </p>
            </div>
          </div>

          <div className="card bg-base-200 border border-base-300 shadow-xl">
            <div className="card-body gap-3">
              <h3 className="text-sm uppercase tracking-widest text-base-content/50 font-semibold">
                👥 Pemain di Room
              </h3>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {players.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-base-300 rounded-xl px-3 py-2"
                  >
                    <span className="badge badge-secondary badge-sm font-mono">
                      {i + 1}
                    </span>
                    <span className="font-medium text-base-content">
                      {p.nickname}
                    </span>
                    {p.nickname === nickname && (
                      <span className="badge badge-accent badge-xs ml-auto">
                        Kamu
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary opacity-10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary opacity-10 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 pointer-events-none" />

      <div className="z-10 w-full max-w-sm flex flex-col gap-5">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-secondary text-glow-secondary">
            Masuk Room
          </h1>
          <p className="text-base-content/50 text-sm mt-1">
            Masukkan kode dari host
          </p>
        </div>

        <div className="card bg-base-200 border border-base-300 shadow-xl">
          <div className="card-body gap-4">
            <form onSubmit={handleJoin} className="flex flex-col gap-4">
              <div className="form-control gap-1">
                <label className="label py-0">
                  <span className="label-text font-semibold text-base-content/70">
                    Kode Room
                  </span>
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  required
                  placeholder="ABC123"
                  className="input input-bordered input-secondary w-full bg-base-300 mono text-center text-2xl font-bold tracking-widest uppercase"
                />
              </div>

              <div className="form-control gap-1">
                <label className="label py-0">
                  <span className="label-text font-semibold text-base-content/70">
                    Nickname
                  </span>
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={16}
                  required
                  placeholder="Nama panggilan kamu"
                  className="input input-bordered input-primary w-full bg-base-300"
                />
              </div>

              {errorMsg && (
                <div className="alert alert-error text-sm py-2">
                  <span>⚠️ {errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!roomCode || !nickname}
                className="btn btn-secondary btn-lg w-full gap-2 font-bold shadow-lg shadow-secondary/30 hover:-translate-y-1 transition-all duration-200"
              >
                🚀 Masuk!
              </button>
            </form>
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="btn btn-ghost btn-sm text-base-content/40 hover:text-base-content mx-auto"
        >
          ← Kembali ke Home
        </button>
      </div>
    </div>
  );
}
