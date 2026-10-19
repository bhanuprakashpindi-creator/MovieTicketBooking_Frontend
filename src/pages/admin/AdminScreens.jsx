import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getAllScreens,
  getScreensByTheater,
  createScreen,
  updateScreen,
  deleteScreen,
} from "../../api/screenApi";
import { getAllTheaters } from "../../api/theaterApi";
import useDebounce from "../../hooks/useDebounce";

const INITIAL_FORM = {
  theaterId: "",
  screenName: "",
  totalSeats: 60,
};

function AdminScreens() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTheaterId = searchParams.get("theaterId") || "";

  const [theaters, setTheaters] = useState([]);
  const [screens, setScreens] = useState([]);
  const [selectedTheaterFilter, setSelectedTheaterFilter] = useState(urlTheaterId);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    ...INITIAL_FORM,
    theaterId: urlTheaterId,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingScreenId, setEditingScreenId] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Load theaters on mount
  useEffect(() => {
    const fetchTheatersList = async () => {
      try {
        const response = await getAllTheaters();
        const theaterList = response.data || [];
        setTheaters(theaterList);

        // If no theater selected yet and theaters exist, default form theater
        if (!urlTheaterId && theaterList.length > 0) {
          setFormData((prev) => ({
            ...prev,
            theaterId: prev.theaterId || String(theaterList[0].theaterId),
          }));
        }
      } catch (err) {
        console.error("Failed to fetch theaters:", err);
      }
    };

    fetchTheatersList();
  }, [urlTheaterId]);

  // Fetch screens depending on theater selection
  const fetchScreens = async () => {
    try {
      setLoading(true);
      let response;
      if (selectedTheaterFilter) {
        response = await getScreensByTheater(selectedTheaterFilter);
      } else {
        response = await getAllScreens();
      }
      setScreens(response.data || []);
    } catch (err) {
      console.error("Failed to load screens:", err);
      // Fallback: try getAllScreens if theater-filtered endpoint is not implemented
      try {
        const fallback = await getAllScreens();
        setScreens(fallback.data || []);
      } catch (fallbackErr) {
        console.error("Fallback all screens failed:", fallbackErr);
        setAlert({
          type: "error",
          message: "Failed to load screens from the server.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreens();
  }, [selectedTheaterFilter]);

  const handleTheaterFilterChange = (e) => {
    const val = e.target.value;
    setSelectedTheaterFilter(val);
    if (val) {
      setSearchParams({ theaterId: val });
    } else {
      setSearchParams({});
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditClick = (screen) => {
    setIsEditing(true);
    setEditingScreenId(screen.screenId);
    setFormData({
      theaterId: String(screen.theaterId || screen.theater?.theaterId || selectedTheaterFilter || ""),
      screenName: screen.screenName || "",
      totalSeats: screen.totalSeats || 60,
    });
    setAlert({ type: "", message: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingScreenId(null);
    setFormData({
      ...INITIAL_FORM,
      theaterId: selectedTheaterFilter || (theaters[0]?.theaterId ? String(theaters[0].theaterId) : ""),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.theaterId) {
      setAlert({
        type: "error",
        message: "Please select a theater for this screen.",
      });
      return;
    }

    setSubmitting(true);
    setAlert({ type: "", message: "" });

    const payload = {
      theaterId: Number(formData.theaterId),
      screenName: formData.screenName.trim(),
      totalSeats: Number(formData.totalSeats),
    };

    try {
      if (isEditing) {
        await updateScreen(editingScreenId, payload);
        setAlert({
          type: "success",
          message: `Screen "${formData.screenName}" updated successfully!`,
        });
        handleCancelEdit();
      } else {
        await createScreen(payload);
        setAlert({
          type: "success",
          message: `Screen "${formData.screenName}" created successfully!`,
        });
        setFormData({
          ...INITIAL_FORM,
          theaterId: formData.theaterId,
        });
      }
      await fetchScreens();
    } catch (err) {
      console.error("Failed to save screen:", err);
      setAlert({
        type: "error",
        message:
          err.response?.data?.message ||
          (isEditing ? "Failed to update screen." : "Failed to create screen."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteScreen = async (screen) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${screen.screenName}"? This will delete the screen, its seats, and all scheduled shows.`,
    );
    if (!confirmed) return;

    try {
      setDeletingId(screen.screenId);
      setAlert({ type: "", message: "" });
      await deleteScreen(screen.screenId);
      setAlert({
        type: "success",
        message: `Screen "${screen.screenName}" deleted successfully.`,
      });
      if (isEditing && editingScreenId === screen.screenId) {
        handleCancelEdit();
      }
      await fetchScreens();
    } catch (err) {
      console.error("Failed to delete screen:", err);
      setAlert({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to delete screen. It may have existing shows or active bookings.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Helper to resolve theater name
  const getTheaterName = (screen) => {
    const tId = screen.theaterId || screen.theater?.theaterId;
    const match = theaters.find((t) => String(t.theaterId) === String(tId));
    return match ? match.theaterName : screen.theaterName || "Assigned Theater";
  };

  const filteredScreens = screens.filter((s) => {
    const query = debouncedSearchTerm.toLowerCase();
    const tName = getTheaterName(s).toLowerCase();
    return (
      s.screenName?.toLowerCase().includes(query) ||
      tName.includes(query)
    );
  });

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-900 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link
                to="/admin"
                className="text-sm font-semibold text-yellow-400 hover:text-yellow-300 transition">
                ← Admin Dashboard
              </Link>
              <span className="text-gray-600">|</span>
              <Link
                to="/admin/theaters"
                className="text-sm font-semibold text-gray-400 hover:text-white transition">
                🏢 Theaters
              </Link>
            </div>
            <h1 className="text-4xl font-bold">Screen Management</h1>
            <p className="text-gray-400 mt-1">
              Configure auditoriums, capacity, and seating layouts for theaters.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/admin/seats"
              className="bg-slate-800 hover:bg-slate-700 text-gray-300 border border-slate-700 px-4 py-3 rounded-xl text-sm font-semibold transition">
              💺 Manage Seats
            </Link>
            <div className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-3">
              <span className="text-xs uppercase tracking-wider text-gray-400">
                Total Screens
              </span>
              <p className="text-2xl font-bold text-yellow-400">
                {screens.length}
              </p>
            </div>
          </div>
        </div>

        {/* Global Notification Banner */}
        {alert.message && (
          <div
            className={`mb-8 p-4 rounded-xl border flex items-center justify-between gap-4 ${alert.type === "success"
                ? "bg-green-500/10 border-green-500 text-green-400"
                : "bg-red-500/10 border-red-500 text-red-400"
              }`}>
            <span>{alert.message}</span>
            <button
              onClick={() => setAlert({ type: "", message: "" })}
              className="text-sm font-bold opacity-75 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* Screen Form (Add / Edit) */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 mb-12 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isEditing
                  ? `Edit Screen: ${formData.screenName || ""}`
                  : "Add New Screen"}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {isEditing
                  ? "Update screen details below and click Update Screen."
                  : "Assign a new screen or auditorium to a theater."}
              </p>
            </div>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg text-sm transition">
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Select Theater */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Select Theater <span className="text-red-500">*</span>
              </label>
              <select
                name="theaterId"
                value={formData.theaterId}
                onChange={handleChange}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition">
                <option value="">-- Choose a Theater --</option>
                {theaters.map((t) => (
                  <option key={t.theaterId} value={t.theaterId}>
                    {t.theaterName} ({t.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Screen Name */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Screen / Audi Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="screenName"
                value={formData.screenName}
                onChange={handleChange}
                placeholder="e.g. Screen 1 (Dolby Atmos) or IMAX"
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              />
            </div>

            {/* Total Seats */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Total Seat Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="totalSeats"
                value={formData.totalSeats}
                onChange={handleChange}
                placeholder="e.g. 60"
                min="1"
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              />
            </div>

            {/* Submit Actions */}
            <div className="md:col-span-3 flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-3 rounded-lg disabled:opacity-50 transition shadow-lg">
                {submitting
                  ? isEditing
                    ? "Updating Screen..."
                    : "Adding Screen..."
                  : isEditing
                    ? "Update Screen"
                    : "Add Screen"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-lg transition">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Existing Screens Directory */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">Existing Screens Directory</h2>
              <p className="text-sm text-gray-400">
                Showing {filteredScreens.length} of {screens.length} screens
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Theater Filter */}
              <select
                value={selectedTheaterFilter}
                onChange={handleTheaterFilterChange}
                className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-yellow-400">
                <option value="">All Theaters</option>
                {theaters.map((t) => (
                  <option key={t.theaterId} value={t.theaterId}>
                    {t.theaterName}
                  </option>
                ))}
              </select>

              {/* Search Bar */}
              <div className="w-full sm:w-64 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search screens..."
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-yellow-400 transition pr-20"
                />
                {searchTerm.trim() && searchTerm !== debouncedSearchTerm && (
                  <span className="absolute right-3 top-2.5 text-xs text-yellow-400 animate-pulse">
                    Filtering...
                  </span>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">Loading screens...</p>
            </div>
          ) : filteredScreens.length === 0 ? (
            <div className="text-center py-16 bg-slate-800 border border-slate-700 rounded-2xl">
              <p className="text-gray-400 text-lg">
                {searchTerm || selectedTheaterFilter
                  ? "No screens match your search or selected theater."
                  : "No screens configured yet. Add your first screen above!"}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScreens.map((screen) => (
                <div
                  key={screen.screenId}
                  className={`bg-slate-800 border rounded-2xl p-6 shadow-lg transition flex flex-col justify-between ${editingScreenId === screen.screenId
                      ? "border-yellow-400 ring-2 ring-yellow-400/30"
                      : "border-slate-700 hover:border-slate-600"
                    }`}>
                  <div>
                    {/* Screen Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-12 h-12 bg-yellow-500/20 text-yellow-400 rounded-xl flex items-center justify-center text-2xl shrink-0">
                        🎞️
                      </div>

                      <span className="px-3 py-1 bg-slate-900 border border-slate-700 text-gray-300 rounded-full text-xs font-semibold">
                        💺 {screen.totalSeats || 60} Seats
                      </span>
                    </div>

                    {/* Name */}
                    <h3 className="text-xl font-bold text-white mb-1">
                      {screen.screenName}
                    </h3>

                    {/* Theater */}
                    <p className="text-sm text-yellow-400 font-medium flex items-center gap-1.5 mb-4">
                      🏢 {getTheaterName(screen)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-700/80 space-y-2 mt-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(screen)}
                        className="flex-1 bg-yellow-500/20 hover:bg-yellow-500 text-yellow-400 hover:text-black border border-yellow-500/40 py-2 rounded-lg font-semibold text-xs transition">
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteScreen(screen)}
                        disabled={deletingId === screen.screenId}
                        className="flex-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 py-2 rounded-lg font-semibold text-xs transition disabled:opacity-50">
                        {deletingId === screen.screenId ? "Deleting..." : "Delete"}
                      </button>
                    </div>

                    <Link
                      to={`/admin/seats?screenId=${screen.screenId}`}
                      className="block text-center w-full bg-slate-700/70 hover:bg-slate-700 text-gray-300 py-2 rounded-lg text-xs font-semibold transition">
                      Manage Seats Layout →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminScreens;
