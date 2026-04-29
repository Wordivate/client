import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSocket } from "../context/SocketContext";

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
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary opacity-10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent opacity-10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="z-10 w-full max-w-md flex flex-col gap-4">
        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-4xl font-bold text-primary text-glow">
            Host Lobby
          </h1>
          <p className="text-base-content/50 text-sm mt-1">
            Setup ruang trivia kamu
          </p>
        </div>

        {/* Step 1 — Create Room */}
        <div className="card bg-base-200 border border-base-300 shadow-xl">
          <div className="card-body gap-3">
            <h2 className="card-title text-base-content/80 text-sm font-semibold uppercase tracking-widest">
              <span className="badge badge-primary badge-sm">1</span>
              Buat Ruangan
            </h2>
            <button
              onClick={handleCreateRoom}
              disabled={!!roomCode}
              className="btn btn-primary w-full gap-2"
            >
              🏠 {roomCode ? "Ruangan Dibuat" : "Buat Room Baru"}
            </button>

            {roomCode && (
              <div className="bg-base-300 rounded-2xl p-5 text-center border border-primary/30 mt-1">
                <p className="text-base-content/50 text-xs uppercase tracking-widest mb-2">
                  Kode Ruangan
                </p>
                <p className="mono text-5xl font-bold text-secondary text-glow-secondary tracking-[0.2em]">
                  {roomCode}
                </p>
                <p className="text-base-content/40 text-xs mt-2">
                  Bagikan kode ini ke peserta
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Step 2 — Generate Questions */}
        <div className="card bg-base-200 border border-base-300 shadow-xl">
          <div className="card-body gap-3">
            <h2 className="card-title text-base-content/80 text-sm font-semibold uppercase tracking-widest">
              <span className="badge badge-primary badge-sm">2</span>
              Generate Soal via AI
            </h2>
            <input
              type="text"
              placeholder="Topik quiz (contoh: Sejarah Indonesia)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerateQuestions()}
              disabled={!roomCode}
              className="input input-bordered input-secondary w-full bg-base-300 disabled:opacity-50"
            />
            <button
              onClick={handleGenerateQuestions}
              disabled={loading || !topic.trim() || !roomCode}
              className="btn btn-secondary w-full gap-2"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Generating soal...
                </>
              ) : (
                "✨ Generate Soal"
              )}
            </button>

            {!roomCode && (
              <p className="text-base-content/30 text-xs text-center">
                Buat room dulu di langkah 1
              </p>
            )}

            {geminiError && (
              <div className="alert alert-error text-sm py-2">
                <span>⚠️ {geminiError}</span>
              </div>
            )}

            {questionsReady && (
              <div className="alert alert-success text-sm py-2">
                <span>✓ {questionCount} soal siap!</span>
              </div>
            )}
          </div>
        </div>

        {/* Step 3 — Start Game */}
        {questionsReady && (
          <button
            onClick={handleStartGame}
            className="btn btn-warning btn-lg w-full gap-2 text-base-100 font-bold shadow-lg shadow-warning/30 hover:-translate-y-1 transition-all duration-200"
          >
            🎮 Mulai Game!
          </button>
        )}

        {/* Players List */}
        <div className="card bg-base-200 border border-base-300 shadow-xl">
          <div className="card-body gap-3">
            <h2 className="card-title text-base-content/80 text-sm font-semibold uppercase tracking-widest">
              👥 Pemain ({players.length})
            </h2>
            <div className="max-h-44 overflow-y-auto flex flex-col gap-2 pr-1">
              {players.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-4 text-base-content/40">
                  <span className="text-2xl">⏳</span>
                  <span className="text-sm">Menunggu pemain bergabung...</span>
                </div>
              ) : (
                players.map((player, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-base-300 rounded-xl px-3 py-2"
                  >
                    <span className="badge badge-primary badge-sm font-mono">
                      {i + 1}
                    </span>
                    <span className="font-medium text-base-content">
                      {player.nickname}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Back link */}
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
