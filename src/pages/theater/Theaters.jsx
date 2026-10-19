import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAllTheaters } from "../../api/theaterApi";

function Theaters() {
  const { movieId } = useParams();
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        setLoading(true);
        const response = await getAllTheaters();
        setTheaters(response.data || []);
      } catch (err) {
        console.error("Failed to load theaters:", err);
        setError("Failed to load cinemas. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTheaters();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary px-4 sm:px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
          <div className="h-6 bg-bg-surface rounded w-36" />
          <div className="h-10 bg-bg-surface rounded w-64" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 bg-bg-surface rounded-2xl border border-border" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center px-4">
        <div className="text-center p-8 bg-bg-surface border border-border rounded-2xl max-w-md">
          <p className="text-accent-primary font-semibold mb-4">{error}</p>
          <Link
            to={movieId ? `/movies/${movieId}` : "/movies"}
            className="inline-block px-6 py-3 bg-accent-primary hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition"
          >
            ← Back to Movie
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary px-4 sm:px-6 py-10 sm:py-14">
      <div className="max-w-6xl mx-auto">
        {/* BREADCRUMB */}
        {movieId && (
          <div className="mb-6">
            <Link
              to={`/movies/${movieId}`}
              className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary text-xs sm:text-sm font-medium transition"
            >
              <span>←</span>
              <span>Back to Movie Details</span>
            </Link>
          </div>
        )}

        {/* HEADER */}
        <div className="mb-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-primary" />
            <p className="text-xs uppercase tracking-widest text-accent-primary font-bold">
              Step 1: Choose Your Cinema
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mt-1 text-text-primary">
            Select Theater
          </h1>
          <p className="text-text-secondary text-sm sm:text-base mt-2">
            Choose your preferred cinema location to browse available screening times and screens.
          </p>
        </div>

        {/* THEATERS GRID */}
        {theaters.length === 0 ? (
          <div className="text-center py-16 px-4 bg-bg-surface border border-border rounded-2xl max-w-md mx-auto">
            <div className="text-4xl mb-3">🏛️</div>
            <h3 className="text-lg font-bold text-text-primary mb-1">No Theaters Available</h3>
            <p className="text-text-muted text-sm">
              There are currently no theaters registered in the system.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {theaters.map((theater) => (
              <Link
                key={theater.theaterId}
                to={`/movies/${movieId}/theaters/${theater.theaterId}`}
                className="group block"
              >
                <div className="h-full bg-bg-surface border border-border rounded-2xl p-6 shadow-card hover:border-accent-primary/50 hover:shadow-glow-red transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
                  <div>
                    {/* ICON & STATUS */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 bg-accent-primary/10 text-accent-primary border border-accent-primary/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition duration-300">
                        🎭
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald" />
                        {theater.status || "ACTIVE"}
                      </span>
                    </div>

                    {/* NAME */}
                    <h2 className="text-xl font-bold text-text-primary group-hover:text-accent-primary transition line-clamp-1">
                      {theater.theaterName}
                    </h2>

                    {/* LOCATION */}
                    <p className="text-text-secondary text-sm font-medium mt-2 flex items-center gap-1.5">
                      <span>📍</span>
                      <span>
                        {theater.city}, {theater.state}
                      </span>
                    </p>

                    {/* ADDRESS */}
                    {theater.address && (
                      <p className="text-text-muted text-xs mt-2 line-clamp-2 leading-relaxed">
                        {theater.address}
                      </p>
                    )}
                  </div>

                  {/* BOTTOM ACTION */}
                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-text-muted font-medium">View Showtimes</span>
                    <span className="text-sm font-bold text-accent-primary group-hover:translate-x-1 transition duration-200">
                      Select Cinema →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Theaters;
