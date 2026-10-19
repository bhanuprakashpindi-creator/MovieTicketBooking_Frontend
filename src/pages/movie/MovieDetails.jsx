import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMovieById } from "../../api/movieApi";

function MovieDetails() {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const response = await getMovieById(movieId);
        setMovie(response.data);
      } catch (err) {
        console.error("Failed to load movie:", err);
        setError("Movie not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [movieId]);

  // Format minutes into "2h 15m"
  const formatDuration = (mins) => {
    if (!mins) return null;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours === 0) return `${remainingMins}m`;
    return `${hours}h ${remainingMins}m`;
  };

  // Format release date nicely
  const formatReleaseDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Helper to extract YouTube embed URL if applicable
  const getEmbedUrl = (url) => {
    if (!url) return null;
    try {
      if (url.includes("youtube.com/watch?v=")) {
        return url.replace("watch?v=", "embed/");
      }
      if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1]?.split("?")[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary px-4 sm:px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
          <div className="h-6 bg-bg-surface rounded w-32" />
          <div className="bg-bg-surface border border-border rounded-3xl p-6 md:p-8 grid md:grid-cols-12 gap-8">
            <div className="md:col-span-4 aspect-[2/3] bg-bg-elevated rounded-2xl" />
            <div className="md:col-span-8 space-y-4">
              <div className="h-8 bg-bg-elevated rounded w-3/4" />
              <div className="flex gap-2">
                <div className="h-6 bg-bg-elevated rounded w-20" />
                <div className="h-6 bg-bg-elevated rounded w-20" />
              </div>
              <div className="h-24 bg-bg-elevated rounded w-full mt-4" />
              <div className="h-12 bg-bg-elevated rounded-xl w-48 mt-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center px-4">
        <div className="text-center p-8 bg-bg-surface border border-border rounded-3xl max-w-md">
          <div className="text-5xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Movie Not Found</h2>
          <p className="text-text-muted text-sm mb-6">{error || "The requested movie could not be found."}</p>
          <Link
            to="/movies"
            className="inline-block px-6 py-3 bg-accent-primary hover:bg-accent-hover text-white rounded-xl font-semibold text-sm transition"
          >
            ← Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  const castList = movie.cast ? movie.cast.split(",").map((c) => c.trim()) : [];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* Backdrop Header with Poster Blur */}
      <div className="relative overflow-hidden border-b border-border">
        {movie.posterUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15 blur-2xl scale-110 pointer-events-none"
            style={{ backgroundImage: `url(${movie.posterUrl})` }}
            aria-hidden="true"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/95 to-bg-primary/80 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Breadcrumb navigation */}
          <div className="mb-6">
            <Link
              to="/movies"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary text-xs sm:text-sm font-medium transition"
            >
              <span>←</span>
              <span>Back to all movies</span>
            </Link>
          </div>

          {/* Main Showcase Grid */}
          <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Poster */}
            <div className="md:col-span-4 flex justify-center">
              <div className="relative group w-full max-w-sm rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-border bg-bg-surface">
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.movieTitle}
                    className="w-full aspect-[2/3] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-bg-elevated flex flex-col items-center justify-center text-text-muted gap-2">
                    <span className="text-6xl">🎬</span>
                    <span className="text-sm">No Poster Available</span>
                  </div>
                )}

                {/* Rating Badge */}
                {movie.rating ? (
                  <div className="absolute top-4 right-4 bg-bg-primary/90 backdrop-blur-md border border-accent-gold/40 px-3 py-1.5 rounded-xl text-sm font-black text-accent-gold flex items-center gap-1 shadow-lg">
                    <span>⭐</span>
                    <span>{Number(movie.rating).toFixed(1)}/10</span>
                  </div>
                ) : null}

                {/* Certificate */}
                {movie.certificate && (
                  <div className="absolute top-4 left-4 bg-accent-primary/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-white tracking-wider uppercase shadow">
                    {movie.certificate}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Details */}
            <div className="md:col-span-8 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-accent-primary/10 border border-accent-primary/30 px-3 py-1 rounded-full text-xs font-bold text-accent-primary uppercase tracking-widest mb-3">
                  Now Screening
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-text-primary tracking-tight leading-tight">
                  {movie.movieTitle}
                </h1>
              </div>

              {/* Badges / Quick info pills */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs sm:text-sm">
                {movie.genre && (
                  <span className="bg-bg-surface border border-border px-3.5 py-1.5 rounded-xl text-text-secondary font-medium">
                    🎭 {movie.genre}
                  </span>
                )}
                {movie.language && (
                  <span className="bg-bg-surface border border-border px-3.5 py-1.5 rounded-xl text-text-secondary font-medium">
                    🗣️ {movie.language}
                  </span>
                )}
                {movie.durationInMinutes && (
                  <span className="bg-bg-surface border border-border px-3.5 py-1.5 rounded-xl text-text-secondary font-medium">
                    ⏱️ {formatDuration(movie.durationInMinutes)}
                  </span>
                )}
                {movie.releaseDate && (
                  <span className="bg-bg-surface border border-border px-3.5 py-1.5 rounded-xl text-text-secondary font-medium">
                    📅 {formatReleaseDate(movie.releaseDate)}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to={`/movies/${movie.movieId}/theaters`}
                  className="bg-accent-primary hover:bg-accent-hover text-white font-bold px-8 py-4 rounded-2xl shadow-glow-red transition-all duration-200 active:scale-95 flex items-center gap-2 text-base"
                >
                  <span>🎟️</span>
                  <span>Select Theaters & Book</span>
                </Link>

                {movie.trailerUrl && (
                  <button
                    onClick={() => setShowTrailerModal(true)}
                    className="bg-bg-surface hover:bg-bg-elevated border border-border hover:border-text-muted text-text-primary font-semibold px-6 py-4 rounded-2xl transition duration-200 flex items-center gap-2 text-sm"
                  >
                    <span>▶</span>
                    <span>Watch Trailer</span>
                  </button>
                )}
              </div>

              {/* Synopsis */}
              <div className="pt-4 border-t border-border">
                <h2 className="text-lg font-bold text-text-primary mb-2">Synopsis</h2>
                <p className="text-text-secondary leading-relaxed text-sm sm:text-base">
                  {movie.description || "No synopsis available for this title."}
                </p>
              </div>

              {/* Cast & Crew Grid */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                {movie.director && (
                  <div className="bg-bg-surface border border-border p-4 rounded-2xl">
                    <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">
                      Director
                    </p>
                    <p className="font-bold text-text-primary text-base">
                      {movie.director}
                    </p>
                  </div>
                )}

                {castList.length > 0 && (
                  <div className="bg-bg-surface border border-border p-4 rounded-2xl">
                    <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">
                      Top Cast
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {castList.map((member, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-bg-elevated border border-border/80 px-2 py-0.5 rounded-md text-text-secondary font-medium"
                        >
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailerModal && movie.trailerUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowTrailerModal(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-text-primary text-base">
                {movie.movieTitle} — Official Trailer
              </h3>
              <button
                onClick={() => setShowTrailerModal(false)}
                className="text-text-muted hover:text-white p-1 text-xl font-bold"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              {movie.trailerUrl.includes("youtube.com") || movie.trailerUrl.includes("youtu.be") ? (
                <iframe
                  src={getEmbedUrl(movie.trailerUrl)}
                  title={`${movie.movieTitle} Trailer`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-text-muted">
                  <p>External trailer link available:</p>
                  <a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-accent-primary text-white rounded-xl font-semibold text-sm hover:bg-accent-hover transition"
                  >
                    Open Trailer in New Tab →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieDetails;
