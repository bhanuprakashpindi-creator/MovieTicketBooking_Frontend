import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getShowsByMovieAndTheaterAndDate } from "../../api/showApi";

function TheaterShows() {
  const { movieId, theaterId } = useParams();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(todayStr);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Generate next 5 days for quick selection buttons
  const dateOptions = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" });
    const formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { dateStr, dayLabel, formattedDate };
  });

  const fetchShows = async (selectedDate) => {
    setLoading(true);
    setError("");

    try {
      const response = await getShowsByMovieAndTheaterAndDate(
        movieId,
        theaterId,
        selectedDate
      );
      setShows(response.data || []);
    } catch (err) {
      console.error("Failed to load shows:", err);
      setShows([]);
      setError("Failed to load shows for the selected date.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (movieId && theaterId && date) {
      fetchShows(date);
    }
  }, [movieId, theaterId, date]);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary px-4 sm:px-6 py-10 sm:py-14">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-3 text-xs sm:text-sm text-text-secondary">
          <Link to={`/movies/${movieId}/theaters`} className="hover:text-text-primary transition">
            ← Change Cinema
          </Link>
          <span>/</span>
          <span className="text-text-muted">Select Showtime</span>
        </div>

        {/* HEADER */}
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-primary" />
            <p className="text-xs uppercase tracking-widest text-accent-primary font-bold">
              Step 2: Choose Date & Showtime
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mt-1 text-text-primary">
            Available Shows
          </h1>
          <p className="text-text-secondary text-sm sm:text-base mt-2">
            Select a convenient showtime to choose your seats.
          </p>
        </div>

        {/* QUICK DATE PICKER PILLS */}
        <div className="bg-bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
              {dateOptions.map((opt) => {
                const isSelected = date === opt.dateStr;
                return (
                  <button
                    key={opt.dateStr}
                    type="button"
                    onClick={() => setDate(opt.dateStr)}
                    className={`flex flex-col items-center justify-center min-w-[85px] py-2.5 px-3 rounded-xl border text-xs transition duration-200 ${
                      isSelected
                        ? "bg-accent-primary border-accent-primary text-white shadow-button"
                        : "bg-bg-elevated border-border text-text-secondary hover:text-text-primary hover:border-text-muted"
                    }`}
                  >
                    <span className="font-bold">{opt.dayLabel}</span>
                    <span className="text-[11px] opacity-90">{opt.formattedDate}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Date Input */}
            <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
              <label htmlFor="customDate" className="text-xs text-text-muted whitespace-nowrap">
                Other Date:
              </label>
              <input
                id="customDate"
                type="date"
                value={date}
                min={todayStr}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-2 bg-bg-elevated border border-border rounded-xl text-text-primary text-xs outline-none focus:border-accent-primary"
              />
            </div>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-56 bg-bg-surface border border-border rounded-2xl animate-pulse"
              />
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="p-4 bg-accent-primary/10 border border-accent-primary/30 rounded-xl text-accent-primary text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => fetchShows(date)}
              className="text-xs font-bold underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && shows.length === 0 && (
          <div className="text-center py-16 px-4 bg-bg-surface border border-border rounded-2xl max-w-md mx-auto">
            <div className="text-4xl mb-3">🕒</div>
            <h3 className="text-lg font-bold text-text-primary mb-1">No Shows on this Date</h3>
            <p className="text-text-muted text-sm mb-4">
              There are no screenings scheduled for the selected date. Please pick another date.
            </p>
            <button
              onClick={() => setDate(todayStr)}
              className="px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white rounded-xl text-xs font-semibold transition"
            >
              Check Today's Shows
            </button>
          </div>
        )}

        {/* SHOWS GRID */}
        {!loading && shows.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shows.map((show) => {
              const showDate = new Date(show.showDateTime);
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
                    {/* Header info */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
                        <span>🎬</span>
                        <span>{show.screenName || "Main Auditorium"}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20">
                        {show.showStatus || "AVAILABLE"}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-text-primary line-clamp-1 mb-4">
                      {show.movieTitle}
                    </h3>

                    {/* Timing Callout */}
                    <div className="bg-bg-elevated border border-border rounded-xl p-4 flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-text-muted font-medium">
                          Showtime
                        </p>
                        <p className="text-2xl font-black text-accent-gold mt-0.5">
                          {timeString}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-wider text-text-muted font-medium">
                          Price
                        </p>
                        <p className="text-xl font-bold text-text-primary mt-0.5">
                          ₹{show.ticketPrice}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CTA button */}
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

export default TheaterShows;
