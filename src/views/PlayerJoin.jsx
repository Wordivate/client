import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSocket } from "../context/SocketContext";
import "../index.css";

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
    sessionStorage.setItem("nickname", nickname);
    socket.emit("join_room", { roomCode: roomCode.toUpperCase(), nickname });
    setJoined(true);
  };

  // --- STATE 1: MENUNGGU HOST ---
  if (joined && !errorMsg) {
    return (
      <div className="join-container">
        <div className="blob join-blob-top" />

        <div className="join-wrapper text-center">
          <div className="waiting-header">
            <div className="waiting-icon-container">
              <span className="spinner-ring" />
              <span className="waiting-emoji">🎮</span>
            </div>
            <div>
              <h2 className="waiting-title">Menunggu Host...</h2>
              <p className="waiting-subtitle">Game akan segera dimulai</p>
            </div>
          </div>

          <div className="join-card">
            <div className="join-card-body">
              <h3 className="player-list-title">👥 Pemain di Room</h3>
              <div className="player-list">
                {players.map((p, i) => (
                  <div key={i} className="player-item">
                    <span className="badge-secondary">{i + 1}</span>
                    <span className="player-name">{p.nickname}</span>
                    {p.nickname === nickname && (
                      <span className="badge-accent ml-auto">Kamu</span>
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

  // --- STATE 2: FORM MASUK ROOM ---
  return (
    <div className="join-container">
      <div className="blob join-blob-bottom" />
      <div className="blob join-blob-top-small" />

      <div className="join-wrapper">
        <div className="join-header">
          <h1 className="title-glow-secondary">Masuk Room</h1>
          <p className="subtitle-text">Masukkan kode dari host</p>
        </div>

        <div className="join-card">
          <div className="join-card-body">
            <form onSubmit={handleJoin} className="join-form">
              <div className="form-group">
                <label className="form-label">Kode Room</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  required
                  placeholder="ABC123"
                  className="input-field input-code"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nickname</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={16}
                  required
                  placeholder="Nama panggilan kamu"
                  className="input-field"
                />
              </div>

              {errorMsg && (
                <div className="alert-error">
                  <span>⚠️ {errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!roomCode || !nickname}
                className="btn-join"
              >
                Masuk!
              </button>
            </form>
          </div>
        </div>

        <button onClick={() => navigate("/")} className="btn-back">
          ← Kembali ke Home
        </button>
      </div>
    </div>
  );
}
