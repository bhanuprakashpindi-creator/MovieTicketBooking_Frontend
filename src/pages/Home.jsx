import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllMovies } from "../api/movieApi";
import { useAuth } from "../context/AuthContext";
import MovieCard from "../components/movie/MovieCard";

function Home() {
  const { isAuthenticated } = useAuth();
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeMovies = async () => {
      try {
        setLoading(true);
        const response = await getAllMovies(0, 8);
        const list = Array.isArray(response.data)
          ? response.data
          : response.data?.content || [];

        setFeaturedMovies(list);
        if (list.length > 0) {
          // Select highest rated movie with a poster for hero banner
          const withPoster = list.filter((m) => m.posterUrl);
          const pool = withPoster.length > 0 ? withPoster : list;
          const best = [...pool].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
          setHeroMovie(best);
        }
      } catch (err) {
        console.error("Failed to load featured movies for Home:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeMovies();
  }, []);

  return (
    <div className="min-h-[calc(100vh-72px)] bg-bg-primary text-text-primary flex flex-col justify-between">
      <div>
        {/* Dynamic Hero Showcase */}
        {heroMovie ? (
          <section className="relative overflow-hidden bg-bg-primary border-b border-border">
            {/* Background Backdrop with Gradient Overlay */}
            {heroMovie.posterUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-20 blur-xl scale-110 pointer-events-none transition-all duration-1000"
                style={{ backgroundImage: `url(${heroMovie.posterUrl})` }}
                aria-hidden="true"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/90 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-28 grid md:grid-cols-12 gap-8 md:gap-12 items-center">
              <div className="md:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 bg-accent-primary/10 border border-accent-primary/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-accent-primary uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-accent-primary animate-ping" />
                  Featured Premiere
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-text-primary leading-tight">
                  {heroMovie.movieTitle}
                </h1>

                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs sm:text-sm">
                  {heroMovie.rating && (
                    <span className="bg-accent-gold text-bg-primary font-black px-2.5 py-1 rounded-md flex items-center gap-1 shadow">
                      ⭐ {Number(heroMovie.rating).toFixed(1)}/10
                    </span>
                  )}
                  {heroMovie.genre && (
                    <span className="bg-bg-surface/90 border border-border px-3 py-1 rounded-full text-text-secondary font-medium">
                      {heroMovie.genre}
                    </span>
                  )}
                  {heroMovie.language && (
                    <span className="bg-bg-surface/90 border border-border px-3 py-1 rounded-full text-text-secondary font-medium">
                      {heroMovie.language}
                    </span>
                  )}
                  {heroMovie.certificate && (
                    <span className="border border-accent-primary/50 text-accent-primary px-2.5 py-0.5 rounded text-xs font-bold uppercase">
                      {heroMovie.certificate}
                    </span>
                  )}
                  {heroMovie.durationInMinutes && (
                    <span className="text-text-muted font-medium flex items-center gap-1">
                      ⏱ {heroMovie.durationInMinutes} mins
                    </span>
                  )}
                </div>

                <p className="text-text-secondary text-sm sm:text-base md:text-lg line-clamp-3 leading-relaxed max-w-2xl">
                  {heroMovie.description ||
                    "Experience high-octane cinematic storytelling on premium IMAX and Dolby Atmos screens with reserved luxury seating."}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to={`/movies/${heroMovie.movieId}/theaters`}
                    className="bg-accent-primary hover:bg-accent-hover text-white font-bold px-6 sm:px-8 py-3.5 rounded-xl shadow-glow-red transition-all duration-200 active:scale-95 flex items-center gap-2"
                  >
                    <span>🎟️</span>
                    <span>Book Tickets Now</span>
                  </Link>

                  <Link
                    to={`/movies/${heroMovie.movieId}`}
                    className="bg-bg-surface hover:bg-bg-elevated text-text-primary border border-border hover:border-text-muted font-semibold px-5 sm:px-6 py-3.5 rounded-xl transition duration-200"
                  >
                    View Details
                  </Link>

                  {heroMovie.trailerUrl && (
                    <a
                      href={heroMovie.trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-gold text-sm font-semibold px-4 py-3.5 transition"
                    >
                      ▶ Watch Trailer
                    </a>
                  )}
                </div>
              </div>

              {/* Poster Preview Card */}
              <div className="hidden md:flex md:col-span-5 justify-center">
                <div className="relative group w-72 sm:w-80 rounded-2xl overflow-hidden shadow-2xl border border-border/80 transition-all duration-500 hover:scale-105 hover:border-accent-primary/50 hover:shadow-glow-red">
                  {heroMovie.posterUrl ? (
                    <img
                      src={heroMovie.posterUrl}
                      alt={heroMovie.movieTitle}
                      className="w-full h-[420px] object-cover"
                    />
                  ) : (
                    <div className="w-full h-[420px] bg-bg-surface flex items-center justify-center text-5xl">
                      🎬
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/20 to-transparent opacity-90" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <span className="text-[11px] uppercase text-accent-gold font-bold tracking-wider">
                      Now Screening
                    </span>
                    <h3 className="font-bold text-white text-lg truncate mt-1">
                      {heroMovie.movieTitle}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          /* Default Hero fallback if database is empty */
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-24 text-center">
            <p className="text-accent-primary font-bold uppercase tracking-widest text-xs sm:text-sm mb-3">
              Your Ultimate Cinema Portal
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight text-text-primary">
              Book Your Next <span className="text-accent-primary">Blockbuster</span>
            </h1>
            <p className="text-text-secondary max-w-2xl mx-auto text-base sm:text-lg mb-8 leading-relaxed">
              Explore trending releases, choose your preferred auditoriums, select real-time recliner seats, and download digital tickets seamlessly.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/movies"
                className="bg-accent-primary hover:bg-accent-hover text-white font-bold px-8 py-3.5 rounded-xl shadow-glow-red transition active:scale-95"
              >
                Browse Movies
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="bg-bg-surface hover:bg-bg-elevated border border-border text-text-primary font-semibold px-8 py-3.5 rounded-xl transition"
                >
                  Create Account
                </Link>
              )}
            </div>
          </section>
        )}

        {/* Now Showing Movies Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-primary animate-pulse" />
                <p className="text-xs uppercase tracking-widest text-accent-primary font-bold">
                  In Theaters
                </p>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-text-primary mt-1">
                Now Showing
              </h2>
            </div>
            <Link
              to="/movies"
              className="text-sm font-semibold text-accent-gold hover:underline transition flex items-center gap-1 self-start sm:self-auto"
            >
              Explore All Movies →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-bg-surface border border-border rounded-2xl h-96 animate-pulse"
                />
              ))}
            </div>
          ) : featuredMovies.length === 0 ? (
            <div className="text-center py-16 px-4 bg-bg-surface/50 border border-border rounded-2xl max-w-md mx-auto">
              <div className="text-4xl mb-3">🎬</div>
              <p className="text-text-secondary text-base font-semibold">No movies currently in the catalogue.</p>
              <Link
                to="/admin/movies"
                className="inline-block mt-4 text-accent-gold font-semibold text-sm hover:underline"
              >
                Add movies via Admin Dashboard →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredMovies.map((movie) => (
                <MovieCard key={movie.movieId} movie={movie} />
              ))}
            </div>
          )}
        </section>

        {/* Feature Highlights Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-border">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-accent-primary font-bold uppercase tracking-widest text-xs">
              Cinema Innovation
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-text-primary mt-1">
              Why Book With MovieBooking?
            </h2>
            <p className="text-text-muted text-sm mt-2">
              Next-generation cinema ticketing designed for film lovers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-bg-surface border border-border hover:border-accent-primary/40 p-6 sm:p-8 rounded-2xl shadow-card transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-accent-primary/10 text-accent-primary rounded-xl flex items-center justify-center text-2xl mb-4 border border-accent-primary/20">
                💺
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Real-Time Seating</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Pick your preferred seat with interactive visual row maps. Support for Regular, Premium, and Recliner tiers.
              </p>
            </div>

            <div className="bg-bg-surface border border-border hover:border-accent-gold/40 p-6 sm:p-8 rounded-2xl shadow-card transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-accent-gold/10 text-accent-gold rounded-xl flex items-center justify-center text-2xl mb-4 border border-accent-gold/20">
                📱
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Digital QR E-Tickets</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                No paper queues. Get instant digital tickets with scannable QR codes sent right to your dashboard and printable on demand.
              </p>
            </div>

            <div className="bg-bg-surface border border-border hover:border-accent-emerald/40 p-6 sm:p-8 rounded-2xl shadow-card transition-all duration-300 hover:-translate-y-1 sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 bg-accent-emerald/10 text-accent-emerald rounded-xl flex items-center justify-center text-2xl mb-4 border border-accent-emerald/20">
                🛡️
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Hassle-Free Cancellations</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Plans changed? Cancel reservations anytime before showtime directly from your profile with instant seat release.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
