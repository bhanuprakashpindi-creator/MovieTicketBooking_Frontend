import { Link } from "react-router-dom";

function MovieCard({ movie }) {
  if (!movie) return null;

  return (
    <div className="group relative bg-bg-surface border border-border hover:border-accent-primary/40 rounded-2xl overflow-hidden shadow-card hover:shadow-glow-red transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5">
      {/* Poster Image Container */}
      <Link
        to={`/movies/${movie.movieId}`}
        className="block relative aspect-[2/3] w-full overflow-hidden bg-bg-elevated cursor-pointer"
      >
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.movieTitle}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-muted gap-2 bg-gradient-to-b from-bg-elevated to-bg-surface">
            <span className="text-4xl">🎬</span>
            <span className="text-xs font-medium">No Poster Available</span>
          </div>
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-transparent to-black/20 pointer-events-none" />

        {/* Rating Badge */}
        {movie.rating ? (
          <div className="absolute top-3 right-3 bg-bg-primary/85 backdrop-blur-md border border-accent-gold/30 px-2.5 py-1 rounded-lg text-xs font-bold text-accent-gold flex items-center gap-1 shadow-md">
            <span>⭐</span>
            <span>{Number(movie.rating).toFixed(1)}</span>
          </div>
        ) : null}

        {/* Certificate Badge */}
        {movie.certificate && (
          <div className="absolute top-3 left-3 bg-accent-primary/90 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] font-bold text-white tracking-wider uppercase shadow">
            {movie.certificate}
          </div>
        )}

        {/* Quick View Hover Pill */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none">
          <span className="bg-bg-primary/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-border backdrop-blur-md whitespace-nowrap shadow-lg">
            Quick View →
          </span>
        </div>
      </Link>

      {/* Info Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          <Link
            to={`/movies/${movie.movieId}`}
            className="block"
            title={movie.movieTitle}
          >
            <h3 className="font-bold text-base sm:text-lg text-text-primary group-hover:text-accent-primary transition-colors duration-200 line-clamp-1">
              {movie.movieTitle}
            </h3>
          </Link>

          {/* Genre & Language badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs text-text-muted">
            {movie.genre && (
              <span className="bg-bg-elevated border border-border px-2 py-0.5 rounded-md text-[11px] font-medium text-text-secondary">
                {movie.genre}
              </span>
            )}
            {movie.language && (
              <span className="bg-bg-elevated border border-border px-2 py-0.5 rounded-md text-[11px] font-medium text-text-secondary">
                {movie.language}
              </span>
            )}
            {movie.durationInMinutes && (
              <span className="text-[11px] text-text-muted ml-auto font-medium">
                ⏱ {movie.durationInMinutes}m
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-border/60 flex items-center gap-2">
          <Link
            to={`/movies/${movie.movieId}/theaters`}
            className="flex-1 text-center bg-accent-primary hover:bg-accent-hover text-white text-xs sm:text-sm font-semibold py-2.5 px-3 rounded-xl shadow-button transition-all duration-200 active:scale-95"
          >
            Book Tickets
          </Link>
          <Link
            to={`/movies/${movie.movieId}`}
            className="p-2.5 rounded-xl bg-bg-elevated hover:bg-bg-surface border border-border hover:border-text-muted text-text-secondary hover:text-text-primary transition-all duration-200 text-xs sm:text-sm"
            title="Details"
            aria-label={`View details for ${movie.movieTitle}`}
          >
            ℹ️
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
