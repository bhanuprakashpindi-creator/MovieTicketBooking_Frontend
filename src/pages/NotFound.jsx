import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-bg-primary text-text-primary flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-lg mx-auto space-y-6">
        <div className="relative inline-block">
          <span className="text-8xl sm:text-9xl font-black text-bg-elevated select-none tracking-widest block">
            404
          </span>
          <span className="absolute inset-0 flex items-center justify-center text-5xl">
            📽️
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">
            Lost in the Auditorium?
          </h1>
          <p className="text-text-muted text-sm sm:text-base leading-relaxed">
            The page or screening you're looking for has moved, ended its run, or does not exist.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="px-6 py-3.5 bg-accent-primary hover:bg-accent-hover text-white rounded-xl font-bold text-sm shadow-button transition active:scale-95"
          >
            Go to Homepage
          </Link>
          <Link
            to="/movies"
            className="px-6 py-3.5 bg-bg-surface hover:bg-bg-elevated border border-border text-text-primary rounded-xl font-semibold text-sm transition"
          >
            Explore Movies
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
