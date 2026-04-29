import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useSocket } from "../context/SocketContext";
import WordCloud from "../components/WordCloud";

export default function HostGame() {
  const socket = useSocket();
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [isLastQuestion, setIsLastQuestion] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleNewQuestion = ({ index, text, total }) => {
      setCurrentQuestionIndex(index);
      setQuestion(text);
      setTotalQuestions(total);
      setAnswers([]);
      setIsLastQuestion(index === total - 1);
    };
    const handleWordcloudUpdate = ({ answers }) => setAnswers(answers);
    const handleGradingStart = () => setLoading(true);
    const handleShowLeaderboard = () => navigate("/leaderboard");

    socket.on("new_question", handleNewQuestion);
    socket.on("wordcloud_update", handleWordcloudUpdate);
    socket.on("grading_start", handleGradingStart);
    socket.on("show_leaderboard", handleShowLeaderboard);
    socket.emit("get_current_question");

    return () => {
      socket.off("new_question", handleNewQuestion);
      socket.off("wordcloud_update", handleWordcloudUpdate);
      socket.off("grading_start", handleGradingStart);
      socket.off("show_leaderboard", handleShowLeaderboard);
    };
  }, [socket, navigate]);

  const progress = totalQuestions
    ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="z-10 w-full max-w-4xl flex flex-col gap-5">
        {/* Header bar */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary text-glow">
            🎮 Host Game
          </h1>
          {totalQuestions > 0 && (
            <div className="badge badge-outline badge-primary text-sm font-mono px-3 py-3">
              {currentQuestionIndex + 1} / {totalQuestions}
            </div>
          )}
        </div>

        {/* Progress bar */}
        {totalQuestions > 0 && (
          <div className="w-full">
            <progress
              className="progress progress-primary w-full h-3"
              value={progress}
              max="100"
            />
          </div>
        )}

        {/* Question card */}
        {question ? (
          <div className="card bg-base-200 border border-primary/30 shadow-2xl card-glow">
            <div className="card-body items-center text-center py-10">
              <p className="text-base-content/50 text-xs uppercase tracking-widest mb-3 font-semibold">
                Soal {currentQuestionIndex + 1}
              </p>
              <p className="text-3xl sm:text-4xl font-bold text-base-content leading-snug max-w-2xl">
                {question}
              </p>
            </div>
          </div>
        ) : (
          <div className="card bg-base-200 border border-base-300 shadow-xl">
            <div className="card-body items-center py-10">
              <span className="loading loading-dots loading-lg text-primary" />
              <p className="text-base-content/50 text-sm mt-2">
                Menunggu soal...
              </p>
            </div>
          </div>
        )}

        {/* Word cloud */}
        <div className="card bg-base-200 border border-base-300 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-base-content/70 text-sm uppercase tracking-widest font-semibold">
              ☁️ Jawaban Peserta
            </h2>
            <div className="flex items-center justify-center rounded-xl bg-base-300/50 overflow-hidden min-h-48">
              {answers.length > 0 ? (
                <WordCloud answers={answers} width={560} height={260} />
              ) : (
                <p className="text-base-content/30 text-sm py-10">
                  Belum ada jawaban masuk...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Grading state */}
        {loading && (
          <div className="alert bg-warning/20 border border-warning/40 text-warning">
            <span className="loading loading-spinner loading-sm" />
            <span className="font-semibold">
              Sedang mengoreksi jawaban dengan AI...
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 justify-center">
          {!isLastQuestion && (
            <button
              onClick={() => socket?.emit("next_question")}
              disabled={loading}
              className="btn btn-primary btn-lg gap-2 px-8 shadow-lg shadow-primary/30 hover:-translate-y-1 transition-all duration-200"
            >
              Soal Berikutnya →
            </button>
          )}
          {isLastQuestion && (
            <button
              onClick={() => socket?.emit("end_game")}
              disabled={loading}
              className="btn btn-success btn-lg gap-2 px-8 shadow-lg shadow-success/30 hover:-translate-y-1 transition-all duration-200"
            >
              🏆 Selesai & Lihat Hasil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
