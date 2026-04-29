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

    const handleWordcloudUpdate = ({ answers }) => {
      setAnswers(answers);
    };

    const handleGradingStart = () => {
      setLoading(true);
    };

    const handleShowLeaderboard = () => {
      navigate("/leaderboard");
    };

    socket.on("new_question", handleNewQuestion);
    socket.on("wordcloud_update", handleWordcloudUpdate);
    socket.on("grading_start", handleGradingStart);
    socket.on("show_leaderboard", handleShowLeaderboard);

    return () => {
      socket.off("new_question", handleNewQuestion);
      socket.off("wordcloud_update", handleWordcloudUpdate);
      socket.off("grading_start", handleGradingStart);
      socket.off("show_leaderboard", handleShowLeaderboard);
    };
  }, [socket, navigate]);

  const handleNextQuestion = () => {
    if (!socket) return;
    socket.emit("next_question");
  };

  const handleEndGame = () => {
    if (!socket) return;
    socket.emit("end_game");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Host Game
        </h1>

        {/* Question Section */}
        {question && (
          <div className="mb-8">
            {/* Question Counter */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-lg font-bold text-blue-600">
                Soal {currentQuestionIndex + 1} dari {totalQuestions}
              </p>
              <div className="w-48 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Question Text */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8">
              <p className="text-3xl font-bold text-gray-800 text-center">
                {question}
              </p>
            </div>
          </div>
        )}

        {/* WordCloud Section */}
        <div className="mb-8 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Jawaban Peserta
          </h2>
          <WordCloud answers={answers} />
        </div>

        {/* Grading Loading State */}
        {loading && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg mb-6 text-center">
            <p className="font-semibold flex items-center justify-center gap-2">
              <span className="inline-block animate-spin">⏳</span>
              Sedang mengoreksi jawaban...
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          {!isLastQuestion && (
            <button
              onClick={handleNextQuestion}
              disabled={loading}
              className={`font-bold px-6 py-3 rounded-lg transition text-lg ${
                loading
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              Soal Berikutnya
            </button>
          )}

          {isLastQuestion && (
            <button
              onClick={handleEndGame}
              disabled={loading}
              className={`font-bold px-6 py-3 rounded-lg transition text-lg ${
                loading
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              ✓ Selesai & Lihat Hasil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
