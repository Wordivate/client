import React, { useState, useEffect } from "react";
import { socket } from "../socket";

export default function HostLobby() {
  const [roomCode, setRoomCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [players, setPlayers] = useState([]);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [questionsReady, setQuestionsReady] = useState(false);
  const [geminiError, setGeminiError] = useState("");

  useEffect(() => {
    socket.on("room_created", (code) => {
      setRoomCode(code);
    });

    socket.on("player_joined", (player) => {
      setPlayers((prevPlayers) => [...prevPlayers, player]);
    });

    socket.on("questions_ready", (count) => {
      setQuestionsReady(count);
      setLoading(false);
      setTopic(""); // Clear topic input after successful generation
    });

    socket.on("gemini_error", (error) => {
      setGeminiError(error);
      setLoading(false);
    });

    return () => {
      socket.off("room_created");
      socket.off("player_joined");
      socket.off("questions_ready");
      socket.off("gemini_error");
    };
  }, []);

  const handleCreateRoom = () => {
    socket.emit("create_room");
  };

  const handleJoinRoom = () => {
    if (nickname) socket.emit("join_room", { nickname });
  };

  const handleGenerateQuestions = () => {
    if (!topic.trim()) {
      setGeminiError("Silakan masukkan topik quiz terlebih dahulu");
      return;
    }
    setLoading(true);
    setGeminiError("");
    socket.emit("generate_questions", { topic });
  };

  const handleStartGame = () => {
    socket.emit("start_game");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">
          Host Lobby
        </h1>

        {/* Create Room Button */}
        <button
          onClick={handleCreateRoom}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-3 rounded-lg mb-6 transition"
        >
          Buat Room
        </button>

        {/* Room Code Display */}
        {roomCode && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-6 mb-6 text-center">
            <p className="text-gray-700 text-sm font-semibold mb-2">
              Kode Ruangan
            </p>
            <p className="text-5xl font-bold text-gray-800 tracking-widest">
              {roomCode}
            </p>
          </div>
        )}

        {/* Host Join Room Section */}
        <div className="mb-6 border-t pt-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Nama Anda (Host)
          </label>
          <input
            type="text"
            placeholder="Masukkan nama panggilan"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleJoinRoom}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg transition"
          >
            Bergabung ke Room
          </button>
        </div>

        {/* Quiz Topic Section */}
        <div className="mb-6 border-t pt-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Topik Quiz
          </label>
          <input
            type="text"
            placeholder="Contoh: Sejarah Indonesia"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleGenerateQuestions}
            className={`w-full font-bold px-4 py-2 rounded-lg transition ${
              loading || !topic.trim()
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-purple-500 hover:bg-purple-600 text-white"
            }`}
            disabled={loading || !topic.trim()}
          >
            {loading ? "Generating Soal..." : "Generate Soal"}
          </button>
          {geminiError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mt-2">
              {geminiError}
            </div>
          )}
        </div>

        {/* Questions Ready Section */}
        {questionsReady && (
          <div className="mb-6 border-t pt-6 bg-green-50 p-4 rounded-lg">
            <p className="text-gray-700 font-semibold text-center mb-4">
              ✓ Soal Siap! ({questionsReady} pertanyaan)
            </p>
            <button
              onClick={handleStartGame}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-3 rounded-lg text-lg transition"
            >
              🎮 Mulai Game
            </button>
          </div>
        )}

        {/* Players List Section */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            Daftar Pemain ({players.length})
          </h2>
          <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
            {players.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Menunggu pemain bergabung...
              </p>
            ) : (
              <ul className="space-y-2">
                {players.map((player, index) => (
                  <li
                    key={index}
                    className="bg-white border-l-4 border-blue-500 py-2 px-3 rounded flex items-center"
                  >
                    <span className="inline-block w-6 h-6 bg-blue-500 text-white rounded-full text-center text-xs font-bold mr-3">
                      {index + 1}
                    </span>
                    {player}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
