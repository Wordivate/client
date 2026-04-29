import { useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="z-10 flex flex-col items-center gap-10 px-6 text-center">
        {/* Logo area */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-6xl">🔤</span>
          </div>
          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-glow">
            <span className="text-primary">Word</span>
            <span className="text-base-content">ivate</span>
          </h1>
          <p className="text-base-content/60 text-lg max-w-xs">
            Quiz kata real-time yang seru buat dimainkan bareng!
          </p>
        </div>

        {/* Divider with stars */}
        <div className="flex items-center gap-3 text-base-content/30 text-sm">
          <span>✦</span>
          <span>✦</span>
          <span>✦</span>
        </div>

        {/* Action cards */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm sm:max-w-md">
          <button
            onClick={() => navigate("/host")}
            className="btn btn-primary btn-lg flex-1 gap-3 text-lg font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all duration-200"
          >
            <span className="text-2xl">🎮</span>
            Buat Room
          </button>
          <button
            onClick={() => navigate("/play")}
            className="btn btn-secondary btn-lg flex-1 gap-3 text-lg font-bold shadow-lg shadow-secondary/30 hover:shadow-secondary/50 hover:-translate-y-1 transition-all duration-200"
          >
            <span className="text-2xl">🚀</span>
            Masuk Room
          </button>
        </div>

        {/* Footer note */}
        <p className="text-base-content/30 text-xs">
          Powered by Gemini AI · Real-time via Socket.IO
        </p>
      </div>
    </div>
  );
}
