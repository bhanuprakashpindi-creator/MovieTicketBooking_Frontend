import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllMovies } from "../api/movieApi";
import { useAuth } from "../context/AuthContext";

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
          // Select the highest rated movie or the first one for the Hero banner
          const best = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
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
    <div className="min-h-[calc(100vh-72px)] bg-slate-900 text-white flex flex-col justify-between">
      <div>
        {/* Dynamic Hero Showcase */}
        {heroMovie ? (
          <section className="relative overflow-hidden bg-slate-950 border-b border-slate-800">
            {/* Background Backdrop with Gradient Overlay */}
            {heroMovie.posterUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-25 blur-sm scale-105 transition duration-1000"
                style={{ backgroundImage: `url(${heroMovie.posterUrl})` }}></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent"></div>

            <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-12 gap-10 items-center">
              <div className="md:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-red-400 uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  Featured Premiere
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
                  {heroMovie.movieTitle}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  {heroMovie.rating && (
                    <span className="bg-yellow-400 text-slate-950 font-extrabold px-2.5 py-1 rounded-md flex items-center gap-1 shadow">
                      ⭐ {heroMovie.rating}/10
                    </span>
                  )}
                  {heroMovie.genre && (
                    <span className="bg-slate-800/80 border border-slate-700 px-3 py-1 rounded-full text-gray-300 font-medium">
                      {heroMovie.genre}
                    </span>
                  )}
                  {heroMovie.language && (
                    <span className="bg-slate-800/80 border border-slate-700 px-3 py-1 rounded-full text-gray-300 font-medium">
                      {heroMovie.language}
                    </span>
                  )}
                  {heroMovie.certificate && (
                    <span className="border border-red-500/50 text-red-400 px-2.5 py-0.5 rounded text-xs font-bold">
                      {heroMovie.certificate}
                    </span>
                  )}
                </div>

                <p className="text-gray-300 text-base md:text-lg line-clamp-3 leading-relaxed max-w-xl">
                  {heroMovie.description ||
                    "Experience high-octane cinematic storytelling on premium IMAX and Dolby Atmos screens with reserved luxury seating."}
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <Link
                    to={
                      isAuthenticated
                        ? `/movies/${heroMovie.movieId}/theaters`
                        : "/login"
                    }
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-red-600/30 transition duration-200 hover:scale-105 flex items-center gap-2">
                    🎟️ Book Tickets Now
                  </Link>
                  <Link
                    to={
                      isAuthenticated
                        ? `/movies/${heroMovie.movieId}`
                        : "/movies"
                    }
                    className="bg-slate-800/90 hover:bg-slate-750 text-gray-200 border border-slate-700 font-semibold px-6 py-3.5 rounded-xl transition">
                    View Details
                  </Link>
                </div>
              </div>

              {/* Poster Preview Card */}
              <div className="hidden md:flex md:col-span-5 justify-center">
                <div className="relative group w-72 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 transition duration-300 hover:scale-105">
                  {heroMovie.posterUrl ? (
                    <img
                      src={heroMovie.posterUrl}
                      alt={heroMovie.movieTitle}
                      className="w-full h-96 object-cover"
                    />
                  ) : (
                    <div className="w-full h-96 bg-slate-800 flex items-center justify-center text-5xl">
                      🎬
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-xs uppercase text-yellow-400 font-bold tracking-wider">
                      Now Screening
                    </span>
                    <h3 className="font-bold text-white text-lg truncate">
                      {heroMovie.movieTitle}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          /* Default Hero fallback if database is empty */
          <section className="max-w-7xl mx-auto px-6 py-24 text-center">
            <p className="text-red-500 font-semibold uppercase tracking-widest mb-4">
              Your Ultimate Cinema Portal
            </p>
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
              Book Your Next <span className="text-red-500">Blockbuster</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-10 leading-relaxed">
              Explore trending releases, choose your preferred auditoriums, select real-time recliner seats, and download digital tickets seamlessly.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/movies"
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-red-600/30 transition">
                Browse Movies
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-8 py-3.5 rounded-xl transition">
                  Create Account
                </Link>
              )}
            </div>
          </section>
        )}

        {/* Now Showing Movies Section */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <p className="text-xs uppercase tracking-widest text-red-400 font-bold">
                  In Theaters
                </p>
              </div>
              <h2 className="text-3xl font-extrabold text-white mt-1">
                Now Showing
              </h2>
            </div>
            <Link
              to="/movies"
              className="text-sm font-semibold text-yellow-400 hover:text-yellow-300 transition flex items-center gap-1">
              Explore All Movies →
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-slate-800 border border-slate-700 rounded-2xl h-80 animate-pulse"></div>
              ))}
            </div>
          ) : featuredMovies.length === 0 ? (
            <div className="text-center py-16 bg-slate-800/50 border border-slate-700/60 rounded-2xl">
              <div className="text-5xl mb-3">🎬</div>
              <p className="text-gray-400 text-lg">No movies currently in the catalogue.</p>
              <Link
                to="/admin/movies"
                className="inline-block mt-4 text-yellow-400 font-semibold text-sm hover:underline">
                Add movies via Admin Dashboard
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredMovies.map((movie) => (
                <div
                  key={movie.movieId}
                  className="group bg-slate-800/90 border border-slate-700 hover:border-red-500/50 rounded-2xl overflow-hidden shadow-lg transition duration-300 hover:-translate-y-1.5 flex flex-col justify-between">
                  <div>
                    {/* Poster with hover overlay */}
                    <div className="relative h-64 bg-slate-700 overflow-hidden">
                      {movie.posterUrl ? (
                        <img
                          src={movie.posterUrl}
                          alt={movie.movieTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-500">
                          🎬
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-yellow-400 flex items-center gap-1 shadow">
                        ⭐ {movie.rating || "N/A"}
                      </div>
                      {movie.certificate && (
                        <div className="absolute bottom-3 left-3 bg-red-600/90 px-2 py-0.5 rounded text-xs font-bold text-white uppercase">
                          {movie.certificate}
                        </div>
                      )}
                    </div>

                    {/* Movie Info */}
                    <div className="p-5">
                      <h3 className="font-bold text-lg text-white group-hover:text-red-400 transition truncate">
                        {movie.movieTitle}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                        <span>{movie.genre || "Cinema"}</span>
                        <span>•</span>
                        <span>{movie.language || "Standard"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Link
                      to={
                        isAuthenticated
                          ? `/movies/${movie.movieId}/theaters`
                          : "/movies"
                      }
                      className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-md shadow-red-600/20">
                      Book Tickets
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Feature Highlights Section */}
        <section className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-red-500 font-semibold uppercase tracking-widest text-xs">
              Cinema Innovation
            </p>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              Why Book With MovieBooking?
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              Next-generation cinema ticketing designed for film lovers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 border border-slate-700/80 p-8 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center text-2xl mb-4">
                💺
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Real-Time Seating</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Pick your preferred seat with interactive visual row maps. Support for Regular, Premium, and Recliner tiers.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 p-8 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-yellow-500/10 text-yellow-400 rounded-xl flex items-center justify-center text-2xl mb-4">
                📱
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Digital QR E-Tickets</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                No paper queues. Get instant digital tickets with scannable QR codes sent right to your dashboard and printable on demand.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 p-8 rounded-2xl shadow-lg">
              <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center text-2xl mb-4">
                🛡️
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Hassle-Free Cancellations</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Plans changed? Cancel reservations anytime before showtime directly from your profile with instant seat release.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Modern Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 px-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} MovieBooking Systems. Full-Stack Portfolio Application.</p>
          <div className="flex items-center gap-6">
            <Link to="/movies" className="hover:text-gray-300 transition">Movies</Link>
            <Link to="/profile" className="hover:text-gray-300 transition">Profile</Link>
            <Link to="/admin" className="text-yellow-400/80 hover:text-yellow-400 transition">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
