import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSocket } from "../context/SocketContext";

export default function PlayerGame() {
  const socket = useSocket();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleNewQuestion = ({ index, text, total }) => {
      setQuestion({ index, text, total });
      setAnswer("");
      setSubmitted(false);
      setGrading(false);
    };
    const handleGradingStart = () => setGrading(true);
    const handleShowLeaderboard = () => navigate("/leaderboard");

    socket.on("new_question", handleNewQuestion);
    socket.on("grading_start", handleGradingStart);
    socket.on("show_leaderboard", handleShowLeaderboard);
    socket.emit("get_current_question");

    return () => {
      socket.off("new_question", handleNewQuestion);
      socket.off("grading_start", handleGradingStart);
      socket.off("show_leaderboard", handleShowLeaderboard);
    };
  }, [socket, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = answer.trim().split(/\s+/)[0];
    if (!clean || !question) return;
    socket.emit("submit_answer", {
      questionIndex: question.index,
      answer: clean.toLowerCase(),
    });
    setSubmitted(true);
  };

  if (grading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5 text-center px-6">
          <span
            className="loading loading-dots loading-lg text-warning"
            style={{ width: 60 }}
          />
          <h2 className="text-2xl font-bold text-base-content">
            Menghitung hasil...
          </h2>
          <p className="text-base-content/50 text-sm">
            AI sedang mengoreksi jawaban semua peserta
          </p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5 text-center px-6">
          <span
            className="loading loading-ring text-primary"
            style={{ width: 60 }}
          />
          <h2 className="text-2xl font-bold text-base-content">
            Menunggu soal...
          </h2>
          <p className="text-base-content/50 text-sm">
            Host sedang mempersiapkan game
          </p>
        </div>
      </div>
    );
  }

  const progress = Math.round(((question.index + 1) / question.total) * 100);

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-80 h-80 bg-primary opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-secondary opacity-10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="z-10 w-full max-w-sm flex flex-col gap-5">
        {/* Progress & counter */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-base-content/50 text-xs uppercase tracking-widest font-semibold">
              Soal
            </span>
            <span className="badge badge-outline badge-primary font-mono">
              {question.index + 1} / {question.total}
            </span>
          </div>
          <progress
            className="progress progress-primary w-full h-2"
            value={progress}
            max="100"
          />
        </div>

        {/* Question card */}
        <div className="card bg-base-200 border border-primary/30 shadow-2xl card-glow min-h-40">
          <div className="card-body items-center justify-center text-center py-8">
            <p className="text-2xl sm:text-3xl font-bold text-base-content leading-snug">
              {question.text}
            </p>
          </div>
        </div>

        {/* Answer form */}
        <div className="card bg-base-200 border border-base-300 shadow-xl">
          <div className="card-body gap-4">
            <p className="text-base-content/50 text-xs text-center uppercase tracking-wider">
              Ketik 1 kata jawaban
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={submitted}
                required
                placeholder="Jawaban kamu..."
                className="input input-bordered input-primary w-full bg-base-300 text-center text-xl font-bold tracking-wide"
                autoFocus
              />
              <button
                type="submit"
                disabled={submitted || !answer.trim()}
                className={`btn btn-lg w-full gap-2 font-bold transition-all duration-200 ${
                  submitted
                    ? "btn-success cursor-not-allowed"
                    : "btn-primary hover:-translate-y-1 shadow-lg shadow-primary/30"
                }`}
              >
                {submitted ? <>✓ Jawaban Terkirim!</> : <>🚀 Kirim Jawaban</>}
              </button>
            </form>
          </div>
        </div>

        {submitted && (
          <div className="text-center text-base-content/40 text-sm animate-pulse">
            Menunggu soal berikutnya...
          </div>
        )}
      </div>
    </div>
  );
}
