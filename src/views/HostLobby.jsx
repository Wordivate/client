import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSocket } from "../context/SocketContext";
import "../index.css";

export default function HostLobby() {
  const socket = useSocket();
  const navigate = useNavigate();

  const [roomCode, setRoomCode] = useState("");
  const [players, setPlayers] = useState([]);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [questionsReady, setQuestionsReady] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [geminiError, setGeminiError] = useState("");

  useEffect(() => {
    if (!socket) return;

    const handleRoomCreated = ({ roomCode }) => setRoomCode(roomCode);
    const handlePlayerJoined = ({ players }) => setPlayers(players);
    const handleQuestionsReady = ({ count }) => {
      setQuestionsReady(true);
      setQuestionCount(count);
      setLoading(false);
      setTopic("");
    };
    const handleGeminiError = ({ message }) => {
      setGeminiError(message);
      setLoading(false);
    };
    const handleGameStarted = () => navigate("/host/game");

    socket.on("room_created", handleRoomCreated);
    socket.on("player_joined", handlePlayerJoined);
    socket.on("questions_ready", handleQuestionsReady);
    socket.on("gemini_error", handleGeminiError);
    socket.on("game_started", handleGameStarted);

    return () => {
      socket.off("room_created", handleRoomCreated);
      socket.off("player_joined", handlePlayerJoined);
      socket.off("questions_ready", handleQuestionsReady);
      socket.off("gemini_error", handleGeminiError);
      socket.off("game_started", handleGameStarted);
    };
  }, [socket, navigate]);

  const handleCreateRoom = () => socket?.emit("create_room");

  const handleGenerateQuestions = () => {
    if (!socket) return;
    if (!topic.trim()) {
      setGeminiError("Silakan masukkan topik quiz terlebih dahulu");
      return;
    }
    setLoading(true);
    setGeminiError("");
    socket.emit("generate_questions", { topic });
  };

  const handleStartGame = () => socket?.emit("start_game");

  return (
    <div className="lobby-container">
      {/* Background blobs */}
      <div className="blob lobby-blob-top" />
      <div className="blob lobby-blob-bottom" />

      <div className="lobby-wrapper">
        {/* Header */}
        <div className="lobby-header">
          <h1 className="title-glow">Host Lobby</h1>
          <p className="subtitle-text">Setup ruang trivia kamu</p>
        </div>

        {/* Step 1 — Create Room */}
        <div className="lobby-card">
          <div className="lobby-card-body">
            <h2 className="step-title">
              <span className="badge">1</span> Buat Ruangan
            </h2>
            <button
              onClick={handleCreateRoom}
              disabled={!!roomCode}
              className="btn btn-primary btn-full"
            >
              {roomCode ? "Ruangan Dibuat" : "Buat Room Baru"}
            </button>

            {roomCode && (
              <div className="room-code-box">
                <p className="room-code-label">Kode Ruangan</p>
                <p className="room-code-value">{roomCode}</p>
                <p className="room-code-hint">Bagikan kode ini ke peserta</p>
              </div>
            )}
          </div>
        </div>

        {/* Step 2 — Generate Questions */}
        <div className="lobby-card">
          <div className="lobby-card-body">
            <h2 className="step-title">
              <span className="badge">2</span> Generate Soal via AI
            </h2>
            <input
              type="text"
              placeholder="Topik quiz (contoh: Sejarah Indonesia)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerateQuestions()}
              disabled={!roomCode}
              className="input-field"
            />
            <button
              onClick={handleGenerateQuestions}
              disabled={loading || !topic.trim() || !roomCode}
              className="btn btn-secondary btn-full"
            >
              {loading ? (
                <>
                  <span className="spinner"></span> Generating soal...
                </>
              ) : (
                "Generate Soal"
              )}
            </button>

            {!roomCode && (
              <p className="hint-text">Buat room dulu di langkah 1</p>
            )}

            {geminiError && (
              <div className="alert alert-error">
                <span>⚠️ {geminiError}</span>
              </div>
            )}

            {questionsReady && (
              <div className="alert alert-success">
                <span>✓ {questionCount} soal siap!</span>
              </div>
            )}
          </div>
        </div>

        {/* Step 3 — Start Game */}
        {questionsReady && (
          <button onClick={handleStartGame} className="btn btn-start btn-full">
            Mulai Game!
          </button>
        )}

        {/* Players List */}
        <div className="lobby-card">
          <div className="lobby-card-body">
            <h2 className="step-title">👥 Pemain ({players.length})</h2>
            <div className="player-list">
              {players.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">⏳</span>
                  <span>Menunggu pemain bergabung...</span>
                </div>
              ) : (
                players.map((player, i) => (
                  <div key={i} className="player-item">
                    <span className="badge-small">{i + 1}</span>
                    <span className="player-name">{player.nickname}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Back link */}
        <button onClick={() => navigate("/")} className="btn-back">
          ← Kembali ke Home
        </button>
      </div>
    </div>
  );
}
