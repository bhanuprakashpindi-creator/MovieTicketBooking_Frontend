import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAllTheaters,
  createTheater,
  updateTheater,
  deleteTheater,
} from "../../api/theaterApi";
import useDebounce from "../../hooks/useDebounce";

const INITIAL_FORM = {
  theaterName: "",
  city: "",
  state: "",
  address: "",
  status: "ACTIVE",
};

function AdminTheaters() {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTheaterId, setEditingTheaterId] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchTheaters = async () => {
    try {
      setLoading(true);
      const response = await getAllTheaters();
      setTheaters(response.data || []);
    } catch (err) {
      console.error("Failed to fetch theaters:", err);
      setAlert({
        type: "error",
        message: "Failed to load theaters from the server.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheaters();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditClick = (theater) => {
    setIsEditing(true);
    setEditingTheaterId(theater.theaterId);
    setFormData({
      theaterName: theater.theaterName || "",
      city: theater.city || "",
      state: theater.state || "",
      address: theater.address || "",
      status: theater.status || "ACTIVE",
    });
    setAlert({ type: "", message: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingTheaterId(null);
    setFormData(INITIAL_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert({ type: "", message: "" });

    try {
      if (isEditing) {
        await updateTheater(editingTheaterId, formData);
        setAlert({
          type: "success",
          message: `Theater "${formData.theaterName}" updated successfully!`,
        });
        handleCancelEdit();
      } else {
        await createTheater(formData);
        setAlert({
          type: "success",
          message: `Theater "${formData.theaterName}" added successfully!`,
        });
        setFormData(INITIAL_FORM);
      }
      await fetchTheaters();
    } catch (err) {
      console.error("Failed to save theater:", err);
      setAlert({
        type: "error",
        message:
          err.response?.data?.message ||
          (isEditing ? "Failed to update theater." : "Failed to add theater."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTheater = async (theater) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${theater.theaterName}"? This will delete the theater, its screens, and associated shows.`,
    );
    if (!confirmed) return;

    try {
      setDeletingId(theater.theaterId);
      setAlert({ type: "", message: "" });
      await deleteTheater(theater.theaterId);
      setAlert({
        type: "success",
        message: `Theater "${theater.theaterName}" deleted successfully.`,
      });
      if (isEditing && editingTheaterId === theater.theaterId) {
        handleCancelEdit();
      }
      await fetchTheaters();
    } catch (err) {
      console.error("Failed to delete theater:", err);
      setAlert({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to delete theater. It may contain active screens, shows, or bookings.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTheaters = theaters.filter((t) => {
    const query = debouncedSearchTerm.toLowerCase();
    const matchesSearch =
      t.theaterName?.toLowerCase().includes(query) ||
      t.city?.toLowerCase().includes(query) ||
      t.state?.toLowerCase().includes(query) ||
      t.address?.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "ALL" || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-900 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <Link
              to="/admin"
              className="text-sm font-semibold text-yellow-400 hover:text-yellow-300 flex items-center gap-1 mb-2 transition">
              ← Back to Admin Dashboard
            </Link>
            <h1 className="text-4xl font-bold">Theater Management</h1>
            <p className="text-gray-400 mt-1">
              Add, update, and manage cinema theaters and complexes.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/admin/screens"
              className="bg-slate-800 hover:bg-slate-700 text-gray-300 border border-slate-700 px-4 py-3 rounded-xl text-sm font-semibold transition">
              🎞️ Manage Screens
            </Link>
            <div className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-3">
              <span className="text-xs uppercase tracking-wider text-gray-400">
                Total Theaters
              </span>
              <p className="text-2xl font-bold text-yellow-400">
                {theaters.length}
              </p>
            </div>
          </div>
        </div>

        {/* Global Notification Banner */}
        {alert.message && (
          <div
            className={`mb-8 p-4 rounded-xl border flex items-center justify-between gap-4 ${
              alert.type === "success"
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

        {/* Theater Form (Add / Edit) */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 mb-12 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isEditing
                  ? `Edit Theater: ${formData.theaterName || ""}`
                  : "Add New Theater"}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {isEditing
                  ? "Update theater information below and click Update Theater."
                  : "Enter the details below to register a new theater venue."}
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

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Theater Name */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Theater Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="theaterName"
                value={formData.theaterName}
                onChange={handleChange}
                placeholder="e.g. PVR Cinemas - Forum Mall"
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Operational Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition">
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Hyderabad"
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Telangana"
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Full Address / Street <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. 4th Floor, Forum Sujana Mall, KPHB Phase 9, Kukatpally"
                required
                rows="2"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              />
            </div>

            {/* Form Actions */}
            <div className="md:col-span-2 flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-3 rounded-lg disabled:opacity-50 transition shadow-lg">
                {submitting
                  ? isEditing
                    ? "Updating Theater..."
                    : "Adding Theater..."
                  : isEditing
                    ? "Update Theater"
                    : "Add Theater"}
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

        {/* Existing Theaters Section */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">Theaters Directory</h2>
              <p className="text-sm text-gray-400">
                Showing {filteredTheaters.length} of {theaters.length} theaters
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-yellow-400">
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>

              {/* Debounced Search */}
              <div className="w-full sm:w-64 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, city..."
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
              <p className="text-lg">Loading theaters directory...</p>
            </div>
          ) : filteredTheaters.length === 0 ? (
            <div className="text-center py-16 bg-slate-800 border border-slate-700 rounded-2xl">
              <p className="text-gray-400 text-lg">
                {searchTerm || statusFilter !== "ALL"
                  ? "No theaters match your search or filter criteria."
                  : "No theaters registered in the system yet. Add your first theater above!"}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTheaters.map((theater) => (
                <div
                  key={theater.theaterId}
                  className={`bg-slate-800 border rounded-2xl p-6 shadow-lg transition flex flex-col justify-between ${
                    editingTheaterId === theater.theaterId
                      ? "border-yellow-400 ring-2 ring-yellow-400/30"
                      : "border-slate-700 hover:border-slate-600"
                  }`}>
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="w-12 h-12 bg-red-600/20 text-red-500 rounded-xl flex items-center justify-center text-2xl shrink-0">
                        🎭
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          theater.status === "ACTIVE"
                            ? "bg-green-500/20 text-green-400 border border-green-500/40"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/40"
                        }`}>
                        ● {theater.status}
                      </span>
                    </div>

                    {/* Name & Location */}
                    <h3 className="text-xl font-bold text-white mb-2">
                      {theater.theaterName}
                    </h3>

                    <p className="text-sm text-yellow-400 font-medium flex items-center gap-1.5 mb-2">
                      📍 {theater.city}, {theater.state}
                    </p>

                    <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      {theater.address}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-700/80 space-y-2 mt-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(theater)}
                        className="flex-1 bg-yellow-500/20 hover:bg-yellow-500 text-yellow-400 hover:text-black border border-yellow-500/40 py-2 rounded-lg font-semibold text-xs transition">
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteTheater(theater)}
                        disabled={deletingId === theater.theaterId}
                        className="flex-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 py-2 rounded-lg font-semibold text-xs transition disabled:opacity-50">
                        {deletingId === theater.theaterId ? "Deleting..." : "Delete"}
                      </button>
                    </div>

                    <Link
                      to={`/admin/screens?theaterId=${theater.theaterId}`}
                      className="block text-center w-full bg-slate-700/70 hover:bg-slate-700 text-gray-300 py-2 rounded-lg text-xs font-semibold transition">
                      View Screens →
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

export default AdminTheaters;
