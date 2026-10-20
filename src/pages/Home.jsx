import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAllMovies } from "../api/movieApi";
import { useAuth } from "../context/AuthContext";
import MovieCard from "../components/movie/MovieCard";

function HeroPoster({ movie }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative group w-52 h-[310px] sm:w-64 sm:h-[380px] md:w-80 md:h-[420px] rounded-2xl overflow-hidden shadow-2xl border border-border/80 transition-all duration-500 hover:scale-105 hover:border-accent-primary/50 hover:shadow-glow-red bg-bg-surface flex-shrink-0">
      {movie.posterUrl && !imgError ? (
        <img
          src={movie.posterUrl}
          alt={movie.movieTitle || "Movie Poster"}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          onError={() => setImgError(true)}
          loading="eager"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-b from-bg-elevated to-bg-surface flex flex-col items-center justify-center text-text-muted p-4 text-center">
          <span className="text-5xl sm:text-6xl mb-2">🎬</span>
          <span className="text-xs sm:text-sm font-semibold text-text-secondary line-clamp-2">
            {movie.movieTitle}
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/20 to-transparent opacity-90 pointer-events-none" />
      <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
        <span className="text-[10px] sm:text-[11px] uppercase text-accent-gold font-bold tracking-wider">
          Now Screening
        </span>
        <h3 className="font-bold text-white text-base sm:text-lg truncate mt-0.5">
          {movie.movieTitle}
        </h3>
      </div>
    </div>
  );
}

function Home() {
  const { isAuthenticated } = useAuth();
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const touchStartX = useRef(null);

  useEffect(() => {
    const fetchHomeMovies = async () => {
      try {
        setLoading(true);
        // Fetch up to 50 movies so every available movie in the database is eligible for the carousel
        const response = await getAllMovies(0, 50);
        const list = Array.isArray(response.data)
          ? response.data
          : response.data?.content || [];

        setFeaturedMovies(list);
      } catch (err) {
        console.error("Failed to load featured movies for Home:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeMovies();
  }, []);

  const totalSlides = featuredMovies.length;

  const handlePrev = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  const handleNext = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  // Automatic sliding timer (advances every 4.5 seconds)
  // Re-runs when currentSlide changes to cleanly reset the timer upon manual interaction
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused, totalSlides, currentSlide]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-bg-primary text-text-primary flex flex-col justify-between">
      <div>
        {/* ========================================================= */}
        {/* HERO SECTION: SKELETON / DYNAMIC CAROUSEL / DEFAULT EMPTY */}
        {/* ========================================================= */}
        {loading ? (
          /* Loading Skeleton */
          <section className="relative overflow-hidden bg-bg-primary border-b border-border">
            <div className="relative max-w-7xl mx-auto px-6 sm:px-12 md:px-16 py-14 sm:py-20 md:py-24 grid md:grid-cols-12 gap-8 md:gap-10 items-center animate-pulse">
              <div className="md:col-span-7 space-y-6">
                <div className="h-6 bg-bg-surface rounded-full w-44" />
                <div className="h-12 bg-bg-surface rounded-2xl w-3/4" />
                <div className="flex gap-3">
                  <div className="h-8 bg-bg-surface rounded-lg w-24" />
                  <div className="h-8 bg-bg-surface rounded-full w-24" />
                  <div className="h-8 bg-bg-surface rounded-full w-24" />
                </div>
                <div className="space-y-2.5">
                  <div className="h-4 bg-bg-surface rounded w-full" />
                  <div className="h-4 bg-bg-surface rounded w-5/6" />
                  <div className="h-4 bg-bg-surface rounded w-2/3" />
                </div>
                <div className="flex gap-4 pt-2">
                  <div className="h-12 bg-bg-surface rounded-xl w-44" />
                  <div className="h-12 bg-bg-surface rounded-xl w-36" />
                </div>
              </div>
              <div className="flex md:col-span-5 justify-center">
                <div className="w-52 h-[310px] sm:w-64 sm:h-[380px] md:w-80 md:h-[420px] bg-bg-surface rounded-2xl border border-border" />
              </div>
            </div>
          </section>
        ) : featuredMovies.length > 0 ? (
          /* Dynamic Multi-Movie Hero Carousel */
          <section
            className="relative overflow-hidden bg-bg-primary border-b border-border select-none outline-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="region"
            aria-roledescription="carousel"
            aria-label="Featured Movies Carousel"
          >
            {/* Horizontal Slider Track */}
            <div
              className="flex transition-transform duration-700 ease-in-out will-change-transform"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
            >
              {featuredMovies.map((movie, index) => (
                <div
                  key={movie.movieId || index}
                  className="min-w-full w-full flex-shrink-0 relative overflow-hidden"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${totalSlides}: ${movie.movieTitle}`}
                  aria-hidden={currentSlide !== index}
                >
                  {/* Backdrop Image with Blur and Gradients */}
                  {movie.posterUrl && (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-20 blur-xl scale-110 pointer-events-none transition-all duration-1000"
                      style={{ backgroundImage: `url(${movie.posterUrl})` }}
                      aria-hidden="true"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/95 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent pointer-events-none" />

                  {/* Slide Content Container */}
                  <div className="relative max-w-7xl mx-auto px-8 sm:px-14 md:px-20 py-14 sm:py-20 md:py-24 pb-16 sm:pb-20 md:pb-24 grid md:grid-cols-12 gap-8 md:gap-10 items-center">
                    {/* Left Details Column */}
                    <div className="md:col-span-7 space-y-5 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 bg-accent-primary/10 border border-accent-primary/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-accent-primary uppercase tracking-widest">
                        <span className="w-2 h-2 rounded-full bg-accent-primary animate-ping" />
                        Featured Premiere • {index + 1} of {totalSlides}
                      </div>

                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-text-primary leading-tight">
                        {movie.movieTitle}
                      </h1>

                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3 text-xs sm:text-sm">
                        {movie.rating && (
                          <span className="bg-accent-gold text-bg-primary font-black px-2.5 py-1 rounded-md flex items-center gap-1 shadow">
                            ⭐ {Number(movie.rating).toFixed(1)}/10
                          </span>
                        )}
                        {movie.genre && (
                          <span className="bg-bg-surface/90 border border-border px-3 py-1 rounded-full text-text-secondary font-medium">
                            {movie.genre}
                          </span>
                        )}
                        {movie.language && (
                          <span className="bg-bg-surface/90 border border-border px-3 py-1 rounded-full text-text-secondary font-medium">
                            {movie.language}
                          </span>
                        )}
                        {movie.certificate && (
                          <span className="border border-accent-primary/50 text-accent-primary px-2.5 py-0.5 rounded text-xs font-bold uppercase">
                            {movie.certificate}
                          </span>
                        )}
                        {movie.durationInMinutes && (
                          <span className="text-text-muted font-medium flex items-center gap-1">
                            ⏱ {movie.durationInMinutes} mins
                          </span>
                        )}
                      </div>

                      <p className="text-text-secondary text-sm sm:text-base md:text-lg line-clamp-3 leading-relaxed max-w-2xl mx-auto md:mx-0">
                        {movie.description ||
                          "Experience high-octane cinematic storytelling on premium IMAX and Dolby Atmos screens with reserved luxury seating."}
                      </p>

                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                        <Link
                          to={
                            isAuthenticated
                              ? `/movies/${movie.movieId}/theaters`
                              : "/login"
                          }
                          className="bg-accent-primary hover:bg-accent-hover text-white font-bold px-6 sm:px-8 py-3.5 rounded-xl shadow-glow-red transition-all duration-200 active:scale-95 flex items-center gap-2"
                        >
                          <span>🎟️</span>
                          <span>Book Tickets Now</span>
                        </Link>

                        <Link
                          to={`/movies/${movie.movieId}`}
                          className="bg-bg-surface hover:bg-bg-elevated text-text-primary border border-border hover:border-text-muted font-semibold px-5 sm:px-6 py-3.5 rounded-xl transition duration-200"
                        >
                          View Details
                        </Link>

                        {movie.trailerUrl && (
                          <a
                            href={movie.trailerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-gold text-sm font-semibold px-4 py-3.5 transition"
                          >
                            ▶ Watch Trailer
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right Poster Column */}
                    <div className="flex md:col-span-5 justify-center">
                      <HeroPoster movie={movie} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Prev & Next Arrows (only if more than 1 movie) */}
            {totalSlides > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous movie slide"
                  className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-bg-surface/85 hover:bg-bg-surface text-text-primary hover:text-accent-primary border border-border/80 hover:border-accent-primary/60 shadow-xl backdrop-blur-md flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent-primary group cursor-pointer"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:-translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next movie slide"
                  className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-bg-surface/85 hover:bg-bg-surface text-text-primary hover:text-accent-primary border border-border/80 hover:border-accent-primary/60 shadow-xl backdrop-blur-md flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent-primary group cursor-pointer"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Carousel Indicator Dots */}
                <div
                  role="tablist"
                  aria-label="Movie carousel navigation"
                  className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-surface/80 backdrop-blur-md border border-border/70 max-w-[90vw] overflow-x-auto scrollbar-none"
                >
                  {featuredMovies.map((movie, index) => {
                    const isActive = currentSlide === index;
                    return (
                      <button
                        key={movie.movieId || index}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={`Go to slide ${index + 1}: ${movie.movieTitle}`}
                        onClick={() => handleDotClick(index)}
                        className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-1 focus:ring-accent-primary cursor-pointer ${
                          isActive
                            ? "w-7 sm:w-8 h-2 sm:h-2.5 bg-accent-primary shadow-glow-red"
                            : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-text-muted/40 hover:bg-text-secondary"
                        }`}
                      />
                    );
                  })}
                </div>
              </>
            )}
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

        {/* ========================================================= */}
        {/* NOW SHOWING SECTION                                       */}
        {/* ========================================================= */}
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

        {/* ========================================================= */}
        {/* FEATURE HIGHLIGHTS SECTION                                */}
        {/* ========================================================= */}
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
