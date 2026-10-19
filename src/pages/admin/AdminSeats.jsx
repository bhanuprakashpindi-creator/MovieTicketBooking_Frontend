import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  getSeatsByScreen,
  createSeat,
  updateSeat,
  deleteSeat,
} from "../../api/seatApi";

import { getAllScreens } from "../../api/screenApi";
import { getAllTheaters } from "../../api/theaterApi";

const INITIAL_FORM = {
  screenId: "",
  seatNumber: "",
  seatType: "REGULAR",
};

const SEAT_TYPES = [
  "REGULAR",
  "PREMIUM",
  "VIP",
];

function AdminSeats() {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlScreenId = searchParams.get("screenId") || "";

  const [screens, setScreens] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [seats, setSeats] = useState([]);

  const [selectedScreenFilter, setSelectedScreenFilter] =
    useState(urlScreenId);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState({
    ...INITIAL_FORM,
    screenId: urlScreenId,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingSeatId, setEditingSeatId] = useState(null);

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  const [searchTerm, setSearchTerm] = useState("");

  // --------------------------------------------------
  // Load theaters and screens
  // --------------------------------------------------

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [theaterResponse, screenResponse] = await Promise.all([
          getAllTheaters(),
          getAllScreens(),
        ]);

        setTheaters(theaterResponse.data || []);
        setScreens(screenResponse.data || []);

        // If URL doesn't contain screenId,
        // select the first screen automatically.
        if (!urlScreenId && screenResponse.data?.length > 0) {
          const firstScreenId = String(
            screenResponse.data[0].screenId
          );

          setSelectedScreenFilter(firstScreenId);

          setFormData((prev) => ({
            ...prev,
            screenId: firstScreenId,
          }));

          setSearchParams({
            screenId: firstScreenId,
          });
        }
      } catch (err) {
        console.error("Failed to load screens/theaters:", err);

        setAlert({
          type: "error",
          message: "Failed to load screens and theaters.",
        });
      }
    };

    fetchData();
  }, [urlScreenId, setSearchParams]);

  // --------------------------------------------------
  // Load seats for selected screen
  // --------------------------------------------------

  const fetchSeats = async () => {
    if (!selectedScreenFilter) {
      setSeats([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await getSeatsByScreen(
        selectedScreenFilter
      );

      setSeats(response.data || []);
    } catch (err) {
      console.error("Failed to load seats:", err);

      setSeats([]);

      setAlert({
        type: "error",
        message: "Failed to load seats for this screen.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, [selectedScreenFilter]);

  // --------------------------------------------------
  // Screen filter
  // --------------------------------------------------

  const handleScreenFilterChange = (e) => {
    const value = e.target.value;

    setSelectedScreenFilter(value);

    setIsEditing(false);
    setEditingSeatId(null);

    setFormData({
      ...INITIAL_FORM,
      screenId: value,
    });

    setAlert({
      type: "",
      message: "",
    });

    if (value) {
      setSearchParams({
        screenId: value,
      });
    } else {
      setSearchParams({});
    }
  };

  // --------------------------------------------------
  // Form change
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // Edit seat
  // --------------------------------------------------

  const handleEditClick = (seat) => {
    setIsEditing(true);

    setEditingSeatId(seat.seatId);

    setFormData({
      screenId: String(
        seat.screenId || selectedScreenFilter || ""
      ),
      seatNumber: seat.seatNumber || "",
      seatType: seat.seatType || "REGULAR",
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

  // --------------------------------------------------
  // Cancel edit
  // --------------------------------------------------

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingSeatId(null);

    setFormData({
      ...INITIAL_FORM,
      screenId:
        selectedScreenFilter ||
        (screens[0]?.screenId
          ? String(screens[0].screenId)
          : ""),
    });
  };

  // --------------------------------------------------
  // Submit create/update
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.screenId) {
      setAlert({
        type: "error",
        message: "Please select a screen.",
      });

      return;
    }

    if (!formData.seatNumber.trim()) {
      setAlert({
        type: "error",
        message: "Seat number is required.",
      });

      return;
    }

    setSubmitting(true);

    setAlert({
      type: "",
      message: "",
    });

    const payload = {
      seatNumber: formData.seatNumber.trim(),
      seatType: formData.seatType,
      screenId: Number(formData.screenId),
    };

    try {
      if (isEditing) {
        await updateSeat(editingSeatId, payload);

        setAlert({
          type: "success",
          message: `Seat "${formData.seatNumber}" updated successfully!`,
        });

        handleCancelEdit();
      } else {
        await createSeat(payload);

        setAlert({
          type: "success",
          message: `Seat "${formData.seatNumber}" created successfully!`,
        });

        setFormData({
          ...INITIAL_FORM,
          screenId: formData.screenId,
        });
      }

      await fetchSeats();
    } catch (err) {
      console.error("Failed to save seat:", err);

      setAlert({
        type: "error",
        message:
          err.response?.data?.message ||
          (isEditing
            ? "Failed to update seat."
            : "Failed to create seat."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------
  // Delete seat
  // --------------------------------------------------

  const handleDeleteSeat = async (seat) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete seat "${seat.seatNumber}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(seat.seatId);

      setAlert({
        type: "",
        message: "",
      });

      await deleteSeat(seat.seatId);

      setAlert({
        type: "success",
        message: `Seat "${seat.seatNumber}" deleted successfully.`,
      });

      if (editingSeatId === seat.seatId) {
        handleCancelEdit();
      }

      await fetchSeats();
    } catch (err) {
      console.error("Failed to delete seat:", err);

      setAlert({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to delete seat. It may already be associated with bookings.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  const getTheaterName = (screenId) => {
    const screen = screens.find(
      (s) => String(s.screenId) === String(screenId)
    );

    if (!screen) return "Unknown Theater";

    const theaterId =
      screen.theaterId ||
      screen.theater?.theaterId;

    const theater = theaters.find(
      (t) =>
        String(t.theaterId) === String(theaterId)
    );

    return (
      theater?.theaterName ||
      screen.theaterName ||
      "Assigned Theater"
    );
  };

  const selectedScreen = screens.find(
    (screen) =>
      String(screen.screenId) ===
      String(selectedScreenFilter)
  );

  // --------------------------------------------------
  // Search filtering
  // --------------------------------------------------

  const filteredSeats = seats.filter((seat) => {
    const query = searchTerm.toLowerCase().trim();

    if (!query) return true;

    return (
      seat.seatNumber
        ?.toLowerCase()
        .includes(query) ||
      seat.seatType
        ?.toLowerCase()
        .includes(query)
    );
  });

  // --------------------------------------------------
  // Seat statistics
  // --------------------------------------------------

  const regularSeats = seats.filter(
    (seat) => seat.seatType === "REGULAR"
  ).length;

  const premiumSeats = seats.filter(
    (seat) => seat.seatType === "PREMIUM"
  ).length;

  const vipSeats = seats.filter(
    (seat) => seat.seatType === "VIP"
  ).length;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-900 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link
                to="/admin/screens"
                className="text-sm font-semibold text-yellow-400 hover:text-yellow-300 transition"
              >
                ← Screens
              </Link>

              <span className="text-gray-600">|</span>

              <Link
                to="/admin"
                className="text-sm font-semibold text-gray-400 hover:text-white transition"
              >
                📊 Dashboard
              </Link>
            </div>

            <h1 className="text-4xl font-bold">
              Seat Management
            </h1>

            <p className="text-gray-400 mt-1">
              Configure physical seats for each screen.
            </p>
          </div>

          {/* Statistics */}
          <div className="flex gap-3">
            <div className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-3">
              <span className="text-xs uppercase tracking-wider text-gray-400">
                Total Seats
              </span>

              <p className="text-2xl font-bold text-yellow-400">
                {seats.length}
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-3">
              <span className="text-xs uppercase tracking-wider text-gray-400">
                Regular
              </span>

              <p className="text-2xl font-bold text-blue-400">
                {regularSeats}
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-3">
              <span className="text-xs uppercase tracking-wider text-gray-400">
                Premium
              </span>

              <p className="text-2xl font-bold text-purple-400">
                {premiumSeats}
              </p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-3">
              <span className="text-xs uppercase tracking-wider text-gray-400">
                VIP
              </span>

              <p className="text-2xl font-bold text-red-400">
                {vipSeats}
              </p>
            </div>
          </div>
        </div>

        {/* Alert */}
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

        {/* Screen Selection */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex flex-wrap items-end gap-6">

            <div className="flex-1 min-w-[250px]">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Select Screen
              </label>

              <select
                value={selectedScreenFilter}
                onChange={handleScreenFilterChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-400 transition"
              >
                <option value="">
                  -- Select a Screen --
                </option>

                {screens.map((screen) => (
                  <option
                    key={screen.screenId}
                    value={screen.screenId}
                  >
                    {screen.screenName} —{" "}
                    {getTheaterName(screen.screenId)}
                  </option>
                ))}
              </select>
            </div>

            {selectedScreen && (
              <div className="bg-slate-900 border border-slate-700 rounded-xl px-5 py-3">
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Current Screen
                </p>

                <p className="font-semibold text-yellow-400">
                  {selectedScreen.screenName}
                </p>

                <p className="text-xs text-gray-500">
                  {getTheaterName(selectedScreen.screenId)}
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Add / Edit Seat */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 mb-12 shadow-xl">

          <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">

            <div>
              <h2 className="text-2xl font-bold">
                {isEditing
                  ? `Edit Seat: ${formData.seatNumber}`
                  : "Add New Seat"}
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                {isEditing
                  ? "Update the seat details below."
                  : "Add a physical seat to the selected screen."}
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
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >

            {/* Screen */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Screen <span className="text-red-500">*</span>
              </label>

              <select
                name="screenId"
                value={formData.screenId}
                onChange={handleChange}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              >
                <option value="">
                  -- Choose a Screen --
                </option>

                {screens.map((screen) => (
                  <option
                    key={screen.screenId}
                    value={screen.screenId}
                  >
                    {screen.screenName} —{" "}
                    {getTheaterName(screen.screenId)}
                  </option>
                ))}
              </select>
            </div>

            {/* Seat Number */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Seat Number <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="seatNumber"
                value={formData.seatNumber}
                onChange={handleChange}
                placeholder="e.g. A1, A2, B1"
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              />
            </div>

            {/* Seat Type */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Seat Type <span className="text-red-500">*</span>
              </label>

              <select
                name="seatType"
                value={formData.seatType}
                onChange={handleChange}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              >
                {SEAT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="md:col-span-3 flex items-center gap-4 pt-2">

              <button
                type="submit"
                disabled={submitting}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-3 rounded-lg disabled:opacity-50 transition shadow-lg"
              >
                {submitting
                  ? isEditing
                    ? "Updating Seat..."
                    : "Adding Seat..."
                  : isEditing
                    ? "Update Seat"
                    : "Add Seat"}
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

        {/* Seat Directory */}
        <div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

            <div>
              <h2 className="text-2xl font-bold">
                Seat Directory
              </h2>

              <p className="text-sm text-gray-400">
                Showing {filteredSeats.length} of{" "}
                {seats.length} seats
              </p>
            </div>

            <div className="flex items-center gap-3">

              {/* Search */}
              <div className="w-64">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  placeholder="Search seats..."
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-yellow-400 transition"
                />
              </div>

            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">
                Loading seats...
              </p>
            </div>

          ) : !selectedScreenFilter ? (
            <div className="text-center py-16 bg-slate-800 border border-slate-700 rounded-2xl">
              <p className="text-gray-400 text-lg">
                Please select a screen to view its seats.
              </p>
            </div>

          ) : filteredSeats.length === 0 ? (
            <div className="text-center py-16 bg-slate-800 border border-slate-700 rounded-2xl">
              <p className="text-gray-400 text-lg">
                {searchTerm
                  ? "No seats match your search."
                  : "No seats configured for this screen yet."}
              </p>
            </div>

          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">

              {filteredSeats.map((seat) => (

                <div
                  key={seat.seatId}
                  className={`bg-slate-800 border rounded-xl p-4 transition ${editingSeatId === seat.seatId
                    ? "border-yellow-400 ring-2 ring-yellow-400/30"
                    : "border-slate-700 hover:border-slate-600"
                    }`}
                >

                  {/* Seat Icon */}
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 bg-yellow-500/20 text-yellow-400 rounded-xl flex items-center justify-center text-2xl">
                      💺
                    </div>
                  </div>

                  {/* Seat Number */}
                  <h3 className="text-center font-bold text-white text-lg">
                    {seat.seatNumber}
                  </h3>

                  {/* Type */}
                  <p className="text-center text-xs text-gray-400 mt-1">
                    {seat.seatType}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">

                    <button
                      onClick={() =>
                        handleEditClick(seat)
                      }
                      className="flex-1 bg-yellow-500/20 hover:bg-yellow-500 text-yellow-400 hover:text-black border border-yellow-500/40 py-1.5 rounded-lg font-semibold text-xs transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDeleteSeat(seat)
                      }
                      disabled={
                        deletingId === seat.seatId
                      }
                      className="flex-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 py-1.5 rounded-lg font-semibold text-xs transition disabled:opacity-50"
                    >
                      {deletingId === seat.seatId
                        ? "..."
                        : "Delete"}
                    </button>

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

export default AdminSeats;