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

      // Extract bookings & calculate revenue
      let bookingCount = 0;
      let revenue = 0;
      let confirmedCount = 0;
      if (bookingsRes.status === "fulfilled") {
        const bookingsList = bookingsRes.value?.data || [];
        bookingCount = bookingsList.length;
        const confirmed = bookingsList.filter(
          (b) => b.bookingStatus === "CONFIRMED"
        );
        confirmedCount = confirmed.length;
        revenue = confirmed.reduce(
          (sum, b) => sum + (Number(b.totalAmount) || 0),
          0
        );
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
      color: "from-blue-500/20 to-blue-600/5",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/40",
      actionText: "Manage Movies",
    },
    {
      title: "Theaters",
      icon: "🏢",
      description: "Configure multiplexes, physical venues, cities, and operational status.",
      path: "/admin/theaters",
      count: metrics.theaters,
      countLabel: "Active Theaters",
      color: "from-emerald-500/20 to-emerald-600/5",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
      actionText: "Manage Venues",
    },
    {
      title: "Screens",
      icon: "🎞️",
      description: "Setup auditoriums, screen formats (IMAX, 4DX), and seating capacities.",
      path: "/admin/screens",
      count: metrics.screens,
      countLabel: "Screens Configured",
      color: "from-purple-500/20 to-purple-600/5",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/40",
      actionText: "Manage Screens",
    },
    {
      title: "Seat Layouts",
      icon: "💺",
      description: "Visual screen grid architect, tier pricing (Regular/Recliner), and batch generator.",
      path: "/admin/seats",
      count: "Grid Designer",
      countLabel: "Visual Layouts",
      color: "from-amber-500/20 to-amber-600/5",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      actionText: "Design Layouts",
    },
    {
      title: "Shows & Schedules",
      icon: "🎭",
      description: "Assign movies to theater screens, schedule showtimes, and set ticket rates.",
      path: "/admin/shows",
      count: metrics.shows,
      countLabel: "Scheduled Shows",
      color: "from-rose-500/20 to-rose-600/5",
      badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/40",
      actionText: "Schedule Shows",
    },
    {
      title: "Bookings & Audits",
      icon: "📊",
      description: "Track customer transactions, audit reservations, and process ticket cancellations.",
      path: "/admin/bookings",
      count: metrics.bookings,
      countLabel: "Total Bookings",
      color: "from-indigo-500/20 to-indigo-600/5",
      badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/40",
      actionText: "Audit Bookings",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-900 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
              <p className="text-yellow-400 text-sm font-semibold uppercase tracking-wider">
                System Administration Hub
              </p>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mt-1">
              Admin Command Center
            </h1>
            <p className="text-gray-400 mt-2 max-w-2xl text-sm leading-relaxed">
              Real-time oversight of movies, multiplexes, auditoriums, seating maps, show schedules, and customer revenue.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastRefreshed && (
              <span className="text-xs text-gray-500 hidden sm:inline">
                Synced at {lastRefreshed}
              </span>
            )}
            <button
              onClick={fetchDashboardMetrics}
              disabled={loadingMetrics}
              className="bg-slate-800 hover:bg-slate-700 text-gray-300 border border-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50">
              <span className={loadingMetrics ? "animate-spin" : ""}>🔄</span>
              {loadingMetrics ? "Refreshing..." : "Refresh Metrics"}
            </button>
          </div>
        </div>

        {/* Executive KPI Stats Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/5 rounded-full blur-2xl"></div>
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
              Total Revenue
            </span>
            <p className="text-3xl font-black text-yellow-400 mt-2">
              {loadingMetrics ? (
                <span className="inline-block w-24 h-8 bg-slate-700 animate-pulse rounded"></span>
              ) : (
                `₹${metrics.revenue.toLocaleString()}`
              )}
            </p>
            <span className="text-xs text-gray-400 mt-1 block">
              From confirmed customer bookings
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl"></div>
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
              Confirmed Reservations
            </span>
            <p className="text-3xl font-black text-green-400 mt-2">
              {loadingMetrics ? (
                <span className="inline-block w-16 h-8 bg-slate-700 animate-pulse rounded"></span>
              ) : (
                metrics.confirmedBookings
              )}
            </p>
            <span className="text-xs text-gray-400 mt-1 block">
              {metrics.bookings - metrics.confirmedBookings} cancellations processed
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
              Active Multiplexes
            </span>
            <p className="text-3xl font-black text-blue-400 mt-2">
              {loadingMetrics ? (
                <span className="inline-block w-12 h-8 bg-slate-700 animate-pulse rounded"></span>
              ) : (
                metrics.theaters
              )}
            </p>
            <span className="text-xs text-gray-400 mt-1 block">
              Across {metrics.screens} auditoriums
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl"></div>
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
              Live Showtimes
            </span>
            <p className="text-3xl font-black text-rose-400 mt-2">
              {loadingMetrics ? (
                <span className="inline-block w-12 h-8 bg-slate-700 animate-pulse rounded"></span>
              ) : (
                metrics.shows
              )}
            </p>
            <span className="text-xs text-gray-400 mt-1 block">
              Screening {metrics.movies} catalogue titles
            </span>
          </div>
        </div>

        {/* Quick Actions Shortcuts */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
            ⚡ Quick Operations
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/movies"
              className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm transition flex items-center gap-1.5 shadow-md">
              <span>+</span> Add Movie
            </Link>
            <Link
              to="/admin/theaters"
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition border border-slate-600">
              <span>+</span> Add Theater
            </Link>
            <Link
              to="/admin/shows"
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition border border-slate-600">
              <span>+</span> Schedule Show
            </Link>
            <Link
              to="/admin/seats"
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition border border-slate-600">
              <span>💺</span> Seat Generator
            </Link>
            <Link
              to="/admin/bookings"
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition border border-slate-600">
              <span>📊</span> Audit Bookings
            </Link>
          </div>
        </div>

        {/* Core Administrative Modules Grid */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>⚙️</span> Management Modules
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminModules.map((mod) => (
              <Link
                key={mod.title}
                to={mod.path}
                className="group relative bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 hover:border-yellow-400/50 p-6 rounded-2xl transition duration-300 hover:-translate-y-1 shadow-lg hover:shadow-yellow-400/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl group-hover:scale-110 transition duration-300">
                      {mod.icon}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${mod.badgeColor}`}>
                      {loadingMetrics && typeof mod.count === "number" ? "..." : mod.count}{" "}
                      {typeof mod.count === "number" ? "" : ""}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition mb-2">
                    {mod.title}
                  </h3>

                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    {mod.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-sm">
                  <span className="text-xs text-gray-500 font-medium">
                    {mod.countLabel}
                  </span>
                  <span className="text-yellow-400 font-semibold group-hover:translate-x-1 transition duration-200 flex items-center gap-1">
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
