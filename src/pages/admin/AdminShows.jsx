import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAllShows,
  createShow,
  updateShow,
  deleteShow,
} from "../../api/showApi";
import { getAllMovies } from "../../api/movieApi";
import { getAllTheaters } from "../../api/theaterApi";
import { getAllScreens } from "../../api/screenApi";
import useDebounce from "../../hooks/useDebounce";

const SHOW_STATUSES = ["OPEN", "UPCOMING", "CANCELLED", "COMPLETED"];

const INITIAL_FORM = {
  movieId: "",
  theaterId: "",
  screenId: "",
  showDateTime: "",
  ticketPrice: 200,
  showStatus: "OPEN",
};

function AdminShows() {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [screens, setScreens] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [editingShowId, setEditingShowId] = useState(null);

  const [alert, setAlert] = useState({ type: "", message: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMovieFilter, setSelectedMovieFilter] = useState("");
  const [selectedTheaterFilter, setSelectedTheaterFilter] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Load movies, theaters, screens
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [moviesRes, theatersRes, screensRes] = await Promise.all([
          getAllMovies(0, 100),
          getAllTheaters(),
          getAllScreens(),
        ]);

        setMovies(moviesRes.data?.content || []);
        setTheaters(theatersRes.data || []);
        setScreens(screensRes.data || []);
      } catch (err) {
        console.error("Failed to load metadata:", err);
      }
    };

    fetchMetadata();
  }, []);

  // Fetch all shows
  const fetchShows = async () => {
    try {
      setLoading(true);

      const response = await getAllShows();

      setShows(response.data || []);
    } catch (err) {
      console.error("Failed to load shows:", err);

      setAlert({
        type: "error",
        message: "Failed to load shows from the server.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  // Filter screens belonging to selected theater
  const availableScreens = formData.theaterId
    ? screens.filter(
      (s) =>
        String(s.theaterId || s.theater?.theaterId) ===
        String(formData.theaterId)
    )
    : screens;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      // Reset screen when theater changes
      if (name === "theaterId") {
        updated.screenId = "";
      }

      return updated;
    });
  };

  const handleEditClick = (show) => {
    setIsEditing(true);
    setEditingShowId(show.showId);

    // Convert ISO date to datetime-local format
    let formattedDateTime = "";

    if (show.showDateTime) {
      const dateObj = new Date(show.showDateTime);

      const pad = (n) => String(n).padStart(2, "0");

      formattedDateTime = `${dateObj.getFullYear()}-${pad(
        dateObj.getMonth() + 1
      )}-${pad(dateObj.getDate())}T${pad(
        dateObj.getHours()
      )}:${pad(dateObj.getMinutes())}`;
    }

    // Find theater from selected screen
    const matchingScreen = screens.find(
      (s) =>
        String(s.screenId) ===
        String(show.screenId || show.screen?.screenId)
    );

    const resolvedTheaterId = matchingScreen
      ? String(
        matchingScreen.theaterId ||
        matchingScreen.theater?.theaterId ||
        ""
      )
      : "";

    setFormData({
      movieId: String(
        show.movieId || show.movie?.movieId || ""
      ),

      theaterId: resolvedTheaterId,

      screenId: String(
        show.screenId ||
        show.screen?.screenId ||
        ""
      ),

      showDateTime: formattedDateTime,

      ticketPrice: show.ticketPrice || 200,

      showStatus: show.showStatus || "OPEN",
    });

    setAlert({
      type: "",
      message: "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingShowId(null);
    setFormData(INITIAL_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.movieId ||
      !formData.screenId ||
      !formData.showDateTime
    ) {
      setAlert({
        type: "error",
        message:
          "Please fill in all required fields (Movie, Screen, Show Time).",
      });

      return;
    }

    setSubmitting(true);

    setAlert({
      type: "",
      message: "",
    });

    const payload = {
      movieId: Number(formData.movieId),
      screenId: Number(formData.screenId),
      showDateTime: formData.showDateTime,
      ticketPrice: Number(formData.ticketPrice),
      showStatus: formData.showStatus,
    };

    try {
      if (isEditing) {
        await updateShow(editingShowId, payload);

        setAlert({
          type: "success",
          message: "Show schedule updated successfully!",
        });

        handleCancelEdit();
      } else {
        await createShow(payload);

        setAlert({
          type: "success",
          message: "New show scheduled successfully!",
        });

        setFormData(INITIAL_FORM);
      }

      await fetchShows();
    } catch (err) {
      console.error("Failed to save show:", err);

      setAlert({
        type: "error",
        message:
          err.response?.data?.message ||
          (isEditing
            ? "Failed to update show."
            : "Failed to schedule show."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShow = async (show) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this show for "${show.movieTitle}" at ${new Date(
        show.showDateTime
      ).toLocaleString()}? This will delete all seats and bookings for this show.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(show.showId);

      setAlert({
        type: "",
        message: "",
      });

      await deleteShow(show.showId);

      setAlert({
        type: "success",
        message: "Show deleted successfully.",
      });

      if (
        isEditing &&
        editingShowId === show.showId
      ) {
        handleCancelEdit();
      }

      await fetchShows();
    } catch (err) {
      console.error("Failed to delete show:", err);

      setAlert({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to delete show. It may contain active customer bookings.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredShows = shows.filter((s) => {
    const query = debouncedSearchTerm.toLowerCase();

    const movieMatch =
      !selectedMovieFilter ||
      String(
        s.movieId || s.movie?.movieId
      ) === String(selectedMovieFilter);

    const theaterMatch =
      !selectedTheaterFilter ||
      String(
        s.theaterId ||
        s.screen?.theaterId ||
        s.theater?.theaterId
      ) === String(selectedTheaterFilter) ||
      s.theaterName ===
      theaters.find(
        (t) =>
          String(t.theaterId) ===
          String(selectedTheaterFilter)
      )?.theaterName;

    const textMatch =
      s.movieTitle
        ?.toLowerCase()
        .includes(query) ||
      s.screenName
        ?.toLowerCase()
        .includes(query) ||
      s.theaterName
        ?.toLowerCase()
        .includes(query);

    return (
      movieMatch &&
      theaterMatch &&
      textMatch
    );
  });

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-900 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link
                to="/admin/movies"
                className="text-sm font-semibold text-gray-400 hover:text-white transition"
              >
                🎬 Movies
              </Link>

              <span className="text-gray-600">|</span>

              <Link
                to="/admin/screens"
                className="text-sm font-semibold text-gray-400 hover:text-white transition"
              >
                🎞️ Screens
              </Link>
            </div>

            <h1 className="text-4xl font-bold">
              Show Management
            </h1>

            <p className="text-gray-400 mt-1">
              Schedule showtimes, assign auditoriums, and manage ticket pricing.
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-3">
            <span className="text-xs uppercase tracking-wider text-gray-400">
              Total Shows
            </span>

            <p className="text-2xl font-bold text-yellow-400">
              {shows.length}
            </p>
          </div>
        </div>

        {/* Global Notification */}
        {alert.message && (
          <div
            className={`mb-8 p-4 rounded-xl border flex items-center justify-between gap-4 ${alert.type === "success"
              ? "bg-green-500/10 border-green-500 text-green-400"
              : "bg-red-500/10 border-red-500 text-red-400"
              }`}
          >
            <span>{alert.message}</span>

            <button
              onClick={() =>
                setAlert({
                  type: "",
                  message: "",
                })
              }
              className="text-sm font-bold opacity-75 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Show Scheduling Form */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 mb-12 shadow-xl">

          <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isEditing
                  ? "Edit Show Schedule"
                  : "Schedule New Show"}
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                {isEditing
                  ? "Update show parameters below and click Update Show."
                  : "Pick a movie, select a venue and screen, and configure showtime & price."}
              </p>
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg text-sm transition"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >

            {/* Movie */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Movie <span className="text-red-500">*</span>
              </label>

              <select
                name="movieId"
                value={formData.movieId}
                onChange={handleChange}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              >
                <option value="">
                  -- Select Movie --
                </option>

                {movies.map((m) => (
                  <option
                    key={m.movieId}
                    value={m.movieId}
                  >
                    {m.movieTitle} ({m.language})
                  </option>
                ))}
              </select>
            </div>

            {/* Theater */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Theater / Complex
              </label>

              <select
                name="theaterId"
                value={formData.theaterId}
                onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              >
                <option value="">
                  -- All Theaters --
                </option>

                {theaters.map((t) => (
                  <option
                    key={t.theaterId}
                    value={t.theaterId}
                  >
                    {t.theaterName} ({t.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Screen */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Auditorium / Screen{" "}
                <span className="text-red-500">*</span>
              </label>

              <select
                name="screenId"
                value={formData.screenId}
                onChange={handleChange}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              >
                <option value="">
                  -- Select Screen --
                </option>

                {availableScreens.map((s) => (
                  <option
                    key={s.screenId}
                    value={s.screenId}
                  >
                    {s.screenName} (
                    {s.totalSeats || 60} seats)
                  </option>
                ))}
              </select>
            </div>

            {/* Date Time */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Show Date & Time{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="datetime-local"
                name="showDateTime"
                value={formData.showDateTime}
                onChange={handleChange}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              />
            </div>

            {/* Ticket Price */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Ticket Price (₹){" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="number"
                name="ticketPrice"
                min="0"
                step="10"
                value={formData.ticketPrice}
                onChange={handleChange}
                placeholder="e.g. 250"
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Show Status{" "}
                <span className="text-red-500">*</span>
              </label>

              <select
                name="showStatus"
                value={formData.showStatus}
                onChange={handleChange}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              >
                {SHOW_STATUSES.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="md:col-span-2 lg:col-span-3 flex items-center gap-4 pt-2">

              <button
                type="submit"
                disabled={submitting}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-3 rounded-lg disabled:opacity-50 transition shadow-lg"
              >
                {submitting
                  ? isEditing
                    ? "Updating Show..."
                    : "Scheduling Show..."
                  : isEditing
                    ? "Update Show"
                    : "Schedule Show"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              )}

            </div>
          </form>
        </div>

        {/* Existing Shows */}
        <div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

            <div>
              <h2 className="text-2xl font-bold">
                Scheduled Shows Directory
              </h2>

              <p className="text-sm text-gray-400">
                Showing {filteredShows.length} of{" "}
                {shows.length} shows
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">

              {/* Movie Filter */}
              <select
                value={selectedMovieFilter}
                onChange={(e) =>
                  setSelectedMovieFilter(
                    e.target.value
                  )
                }
                className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-yellow-400"
              >
                <option value="">
                  All Movies
                </option>

                {movies.map((m) => (
                  <option
                    key={m.movieId}
                    value={m.movieId}
                  >
                    {m.movieTitle}
                  </option>
                ))}
              </select>

              {/* Theater Filter */}
              <select
                value={selectedTheaterFilter}
                onChange={(e) =>
                  setSelectedTheaterFilter(
                    e.target.value
                  )
                }
                className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-yellow-400"
              >
                <option value="">
                  All Theaters
                </option>

                {theaters.map((t) => (
                  <option
                    key={t.theaterId}
                    value={t.theaterId}
                  >
                    {t.theaterName}
                  </option>
                ))}
              </select>

              {/* Search */}
              <div className="w-full sm:w-64 relative">

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  placeholder="Search by title, screen..."
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-yellow-400 transition pr-20"
                />

                {searchTerm.trim() &&
                  searchTerm !==
                  debouncedSearchTerm && (
                    <span className="absolute right-3 top-2.5 text-xs text-yellow-400 animate-pulse">
                      Filtering...
                    </span>
                  )}

              </div>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">
                Loading scheduled shows...
              </p>
            </div>

          ) : filteredShows.length === 0 ? (
            <div className="text-center py-16 bg-slate-800 border border-slate-700 rounded-2xl">
              <p className="text-gray-400 text-lg">
                {searchTerm ||
                  selectedMovieFilter ||
                  selectedTheaterFilter
                  ? "No shows match your search criteria."
                  : "No shows scheduled yet. Schedule your first show above!"}
              </p>
            </div>

          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {filteredShows.map((show) => {
                const showDate = new Date(
                  show.showDateTime
                );

                return (
                  <div
                    key={show.showId}
                    className={`bg-slate-800 border rounded-2xl p-6 shadow-lg transition flex flex-col justify-between ${editingShowId === show.showId
                      ? "border-yellow-400 ring-2 ring-yellow-400/30"
                      : "border-slate-700 hover:border-slate-600"
                      }`}
                  >

                    {/* Top Bar */}
                    <div className="flex items-start justify-between gap-3 mb-4">

                      <span className="text-xs uppercase tracking-wider text-red-500 font-bold">
                        Show #{show.showId}
                      </span>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${show.showStatus === "OPEN"
                          ? "bg-green-500/20 text-green-400 border border-green-500/40"
                          : show.showStatus === "UPCOMING"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                            : "bg-red-500/20 text-red-400 border border-red-500/40"
                          }`}
                      >
                        ● {show.showStatus}
                      </span>

                    </div>

                    {/* Movie */}
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
                      {show.movieTitle}
                    </h3>

                    {/* Screen */}
                    <p className="text-sm text-gray-300 font-medium mb-1">
                      🎬 {show.screenName}
                    </p>

                    {show.theaterName && (
                      <p className="text-xs text-yellow-400 mb-3">
                        🏢 {show.theaterName}
                      </p>
                    )}

                    {/* Show Time */}
                    <div className="bg-slate-900/80 rounded-xl p-3 mb-4 border border-slate-700/60">

                      <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                        <span>
                          Show Date & Time
                        </span>

                        <span>
                          Ticket
                        </span>
                      </div>

                      <div className="flex justify-between items-center">

                        <span className="font-bold text-white text-sm">
                          📅{" "}
                          {showDate.toLocaleDateString()}{" "}
                          at{" "}
                          {showDate.toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>

                        <span className="font-extrabold text-red-500 text-base">
                          ₹{show.ticketPrice}
                        </span>

                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-slate-700/80 space-y-2">

                      <div className="flex gap-2">

                        <button
                          onClick={() =>
                            handleEditClick(show)
                          }
                          className="flex-1 bg-yellow-500/20 hover:bg-yellow-500 text-yellow-400 hover:text-black border border-yellow-500/40 py-2 rounded-lg font-semibold text-xs transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteShow(show)
                          }
                          disabled={
                            deletingId === show.showId
                          }
                          className="flex-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 py-2 rounded-lg font-semibold text-xs transition disabled:opacity-50"
                        >
                          {deletingId ===
                            show.showId
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

                      <Link
                        to={`/shows/${show.showId}`}
                        className="block text-center w-full bg-slate-700/70 hover:bg-slate-700 text-gray-300 py-2 rounded-lg text-xs font-semibold transition"
                      >
                        Preview Customer Seat Map →
                      </Link>

                    </div>
                  </div>
                );
              })}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminShows;