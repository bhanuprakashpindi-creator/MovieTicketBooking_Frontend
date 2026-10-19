import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getShowsByMovie } from "../../api/showApi";

function Shows() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchShows = async () => {
      try {
        setLoading(true);
        const response = await getShowsByMovie(movieId);
        setShows(response.data || []);
      } catch (err) {
        console.error("Failed to load shows:", err);
        setError("Failed to load shows for this movie.");
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [movieId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary px-4 sm:px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
          <div className="h-6 bg-bg-surface rounded w-36" />
          <div className="h-10 bg-bg-surface rounded w-64" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            {[1, 2, 3].map((i) => (
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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* BREADCRUMB */}
        <div>
          <Link
            to={movieId ? `/movies/${movieId}` : "/movies"}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary text-xs sm:text-sm font-medium transition"
          >
            <span>←</span>
            <span>Back to Movie</span>
          </Link>
        </div>

        {/* HEADER */}
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-primary" />
            <p className="text-xs uppercase tracking-widest text-accent-primary font-bold">
              All Scheduled Screenings
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mt-1 text-text-primary">
            Available Shows
          </h1>
          {shows.length > 0 && (
            <p className="text-text-secondary text-sm sm:text-base mt-2">
              Viewing screenings for{" "}
              <span className="text-text-primary font-bold">{shows[0].movieTitle}</span>
            </p>
          )}
        </div>

        {/* EMPTY STATE */}
        {shows.length === 0 ? (
          <div className="text-center py-20 px-4 bg-bg-surface border border-border rounded-2xl max-w-md mx-auto">
            <div className="text-4xl mb-3">🕒</div>
            <h3 className="text-lg font-bold text-text-primary mb-1">No Shows Available</h3>
            <p className="text-text-muted text-sm mb-6">
              There are currently no scheduled screenings for this movie.
            </p>
            <button
              onClick={() => navigate("/movies")}
              className="px-6 py-3 bg-accent-primary hover:bg-accent-hover text-white rounded-xl font-semibold text-sm transition"
            >
              Browse Other Movies
            </button>
          </div>
        ) : (
          /* SHOW CARDS */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shows.map((show) => {
              const showDate = new Date(show.showDateTime);
              const dateString = showDate.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              const timeString = showDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={show.showId}
                  className="bg-bg-surface border border-border hover:border-accent-primary/50 rounded-2xl p-6 shadow-card hover:shadow-glow-red transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
                        <span>🎬</span>
                        <span>{show.screenName || "Auditorium"}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20">
                        {show.showStatus || "AVAILABLE"}
                      </span>
                    </div>

                    <div className="bg-bg-elevated border border-border rounded-xl p-4 space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">Date</span>
                        <span className="font-semibold text-text-primary">{dateString}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">Time</span>
                        <span className="text-xl font-black text-accent-gold">{timeString}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                        <span className="text-text-muted">Ticket Price</span>
                        <span className="text-sm font-bold text-text-primary">₹{show.ticketPrice}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/shows/${show.showId}`)}
                    className="w-full py-3 bg-accent-primary hover:bg-accent-hover text-white rounded-xl font-bold text-sm transition shadow-button active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Select Seats</span>
                    <span>→</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Shows;
