import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllMovies } from "../../api/movieApi";
import { getAllTheaters } from "../../api/theaterApi";
import { getAllScreens } from "../../api/screenApi";
import { getAllShows } from "../../api/showApi";
import { getAllBookings } from "../../api/bookingApi";

function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    movies: 0,
    theaters: 0,
    screens: 0,
    shows: 0,
    bookings: 0,
    revenue: 0,
    confirmedBookings: 0,
  });

  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchDashboardMetrics = async () => {
    try {
      setLoadingMetrics(true);

      const results = await Promise.allSettled([
        getAllMovies(0, 1000),
        getAllTheaters(),
        getAllScreens(),
        getAllShows(),
        getAllBookings(),
      ]);

      const [moviesRes, theatersRes, screensRes, showsRes, bookingsRes] = results;

      // Extract movies
      let movieCount = 0;
      if (moviesRes.status === "fulfilled") {
        const data = moviesRes.value?.data;
        movieCount = Array.isArray(data)
          ? data.length
          : data?.content?.length || data?.totalElements || 0;
      }

      // Extract theaters
      let theaterCount = 0;
      if (theatersRes.status === "fulfilled") {
        theaterCount = theatersRes.value?.data?.length || 0;
      }

      // Extract screens
      let screenCount = 0;
      if (screensRes.status === "fulfilled") {
        screenCount = screensRes.value?.data?.length || 0;
      }

      // Extract shows
      let showCount = 0;
      if (showsRes.status === "fulfilled") {
        showCount = showsRes.value?.data?.length || 0;
      }

      // Extract bookings and calculate revenue
      let bookingCount = 0;
      let revenue = 0;
      let confirmedCount = 0;

      if (bookingsRes.status === "fulfilled") {
        const bookingsList = bookingsRes.value?.data || [];
        bookingCount = bookingsList.length;
        const confirmed = bookingsList.filter((b) => b.bookingStatus === "CONFIRMED");
        confirmedCount = confirmed.length;
        revenue = confirmed.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
      }

      setMetrics({
        movies: movieCount,
        theaters: theaterCount,
        screens: screenCount,
        shows: showCount,
        bookings: bookingCount,
        revenue,
        confirmedBookings: confirmedCount,
      });

      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Error aggregating admin metrics:", err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const adminModules = [
    {
      title: "Movies",
      icon: "🎬",
      description: "Manage film catalogue, genres, ratings, and release schedules.",
      path: "/admin/movies",
      count: metrics.movies,
      countLabel: "Movies in Catalogue",
      badgeColor: "bg-accent-primary/10 text-accent-primary border-accent-primary/30",
      actionText: "Manage Movies",
    },
    {
      title: "Theaters",
      icon: "🏢",
      description: "Configure multiplexes, physical venues, cities, and operational status.",
      path: "/admin/theaters",
      count: metrics.theaters,
      countLabel: "Active Theaters",
      badgeColor: "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/30",
      actionText: "Manage Venues",
    },
    {
      title: "Screens",
      icon: "🎞️",
      description: "Setup auditoriums, screen formats (IMAX, 4DX), and seating capacities.",
      path: "/admin/screens",
      count: metrics.screens,
      countLabel: "Screens Configured",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      actionText: "Manage Screens",
    },
    {
      title: "Seat Layouts",
      icon: "💺",
      description: "Visual screen grid architect, tier pricing (Regular/Recliner), and batch generator.",
      path: "/admin/seats",
      count: "Visual Designer",
      countLabel: "Layout Generator",
      badgeColor: "bg-accent-gold/10 text-accent-gold border-accent-gold/30",
      actionText: "Design Layouts",
    },
    {
      title: "Shows & Schedules",
      icon: "🎭",
      description: "Assign movies to theater screens, schedule showtimes, and set ticket rates.",
      path: "/admin/shows",
      count: metrics.shows,
      countLabel: "Scheduled Shows",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      actionText: "Schedule Shows",
    },
    {
      title: "Bookings & Audits",
      icon: "📋",
      description: "Track customer transactions, audit reservations, and process ticket cancellations.",
      path: "/admin/bookings",
      count: metrics.bookings,
      countLabel: "Total Bookings",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      actionText: "Audit Bookings",
    },
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary px-4 sm:px-8 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent-emerald animate-pulse" />
              <p className="text-accent-gold text-xs font-bold uppercase tracking-wider">
                System Administration Hub
              </p>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-text-primary mt-1">
              Admin Command Center
            </h1>
            <p className="text-text-muted mt-1 text-sm">
              Real-time oversight of movies, cinemas, screens, schedules, and revenue.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastRefreshed && (
              <span className="text-xs text-text-muted hidden sm:inline">
                Synced at {lastRefreshed}
              </span>
            )}
            <button
              onClick={fetchDashboardMetrics}
              disabled={loadingMetrics}
              className="px-4 py-2 bg-bg-surface hover:bg-bg-elevated border border-border text-text-primary rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50"
            >
              <span className={loadingMetrics ? "animate-spin" : ""}>🔄</span>
              <span>{loadingMetrics ? "Syncing..." : "Refresh Metrics"}</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Revenue */}
          <div className="bg-bg-surface border border-border rounded-2xl p-6 shadow-card">
            <span className="text-xs uppercase tracking-wider font-semibold text-text-muted">
              Total Revenue
            </span>
            <p className="text-3xl font-black text-accent-gold mt-2">
              {loadingMetrics ? (
                <span className="inline-block w-24 h-8 bg-bg-elevated animate-pulse rounded" />
              ) : (
                `₹${metrics.revenue.toLocaleString()}`
              )}
            </p>
            <span className="text-xs text-text-muted mt-1 block">
              From confirmed bookings
            </span>
          </div>

          {/* Confirmed Reservations */}
          <div className="bg-bg-surface border border-border rounded-2xl p-6 shadow-card">
            <span className="text-xs uppercase tracking-wider font-semibold text-text-muted">
              Confirmed Bookings
            </span>
            <p className="text-3xl font-black text-accent-emerald mt-2">
              {loadingMetrics ? (
                <span className="inline-block w-16 h-8 bg-bg-elevated animate-pulse rounded" />
              ) : (
                metrics.confirmedBookings
              )}
            </p>
            <span className="text-xs text-text-muted mt-1 block">
              {metrics.bookings - metrics.confirmedBookings} cancellations recorded
            </span>
          </div>

          {/* Theaters */}
          <div className="bg-bg-surface border border-border rounded-2xl p-6 shadow-card">
            <span className="text-xs uppercase tracking-wider font-semibold text-text-muted">
              Active Cinemas
            </span>
            <p className="text-3xl font-black text-blue-400 mt-2">
              {loadingMetrics ? (
                <span className="inline-block w-12 h-8 bg-bg-elevated animate-pulse rounded" />
              ) : (
                metrics.theaters
              )}
            </p>
            <span className="text-xs text-text-muted mt-1 block">
              Across {metrics.screens} auditoriums
            </span>
          </div>

          {/* Shows */}
          <div className="bg-bg-surface border border-border rounded-2xl p-6 shadow-card">
            <span className="text-xs uppercase tracking-wider font-semibold text-text-muted">
              Scheduled Shows
            </span>
            <p className="text-3xl font-black text-accent-primary mt-2">
              {loadingMetrics ? (
                <span className="inline-block w-12 h-8 bg-bg-elevated animate-pulse rounded" />
              ) : (
                metrics.shows
              )}
            </p>
            <span className="text-xs text-text-muted mt-1 block">
              Featuring {metrics.movies} movie titles
            </span>
          </div>
        </div>

        {/* Quick Operations Bar */}
        <div className="bg-bg-surface border border-border rounded-2xl p-5 shadow-card">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
            ⚡ Quick Operations
          </h2>
          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/admin/movies"
              className="bg-accent-gold hover:bg-yellow-400 text-bg-primary font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <span>+</span> Add Movie
            </Link>
            <Link
              to="/admin/theaters"
              className="bg-bg-elevated hover:bg-bg-surface border border-border text-text-primary font-semibold px-4 py-2 rounded-xl text-xs transition"
            >
              <span>+</span> Add Theater
            </Link>
            <Link
              to="/admin/shows"
              className="bg-bg-elevated hover:bg-bg-surface border border-border text-text-primary font-semibold px-4 py-2 rounded-xl text-xs transition"
            >
              <span>+</span> Schedule Show
            </Link>
            <Link
              to="/admin/seats"
              className="bg-bg-elevated hover:bg-bg-surface border border-border text-text-primary font-semibold px-4 py-2 rounded-xl text-xs transition"
            >
              <span>💺</span> Seat Generator
            </Link>
            <Link
              to="/admin/bookings"
              className="bg-bg-elevated hover:bg-bg-surface border border-border text-text-primary font-semibold px-4 py-2 rounded-xl text-xs transition"
            >
              <span>📋</span> Audit Bookings
            </Link>
          </div>
        </div>

        {/* Core Administrative Modules */}
        <div>
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <span>⚙️</span> Management Modules
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {adminModules.map((mod) => (
              <Link
                key={mod.title}
                to={mod.path}
                className="group bg-bg-surface hover:bg-bg-elevated border border-border hover:border-accent-gold/40 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 shadow-card flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl group-hover:scale-110 transition duration-200">
                      {mod.icon}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${mod.badgeColor}`}
                    >
                      {loadingMetrics && typeof mod.count === "number" ? "..." : mod.count}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-text-primary group-hover:text-accent-gold transition mb-2">
                    {mod.title}
                  </h3>
                  <p className="text-text-muted text-xs sm:text-sm leading-relaxed mb-6">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-text-muted font-medium">{mod.countLabel}</span>
                  <span className="text-accent-gold font-bold group-hover:translate-x-1 transition flex items-center gap-1">
                    {mod.actionText} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;