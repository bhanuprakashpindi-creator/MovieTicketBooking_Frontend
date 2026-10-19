import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllBookings, cancelBooking } from "../../api/bookingApi";
import useDebounce from "../../hooks/useDebounce";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchBookingsList = async () => {
    try {
      setLoading(true);
      const response = await getAllBookings();
      setBookings(response.data || []);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      setAlert({
        type: "error",
        message: "Failed to load bookings list from the server.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsList();
  }, []);

  const handleCancelBooking = async (booking) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel booking #${booking.bookingId} for customer "${booking.userName || "User"}"? This will release reserved seats.`,
    );
    if (!confirmed) return;

    try {
      setCancellingId(booking.bookingId);
      setAlert({ type: "", message: "" });
      await cancelBooking(booking.bookingId);
      setAlert({
        type: "success",
        message: `Booking #${booking.bookingId} cancelled successfully.`,
      });
      await fetchBookingsList();
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      setAlert({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to cancel booking. It may have already been cancelled.",
      });
    } finally {
      setCancellingId(null);
    }
  };

  // Metrics
  const totalRevenue = bookings
    .filter((b) => b.bookingStatus === "CONFIRMED")
    .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

  const confirmedCount = bookings.filter(
    (b) => b.bookingStatus === "CONFIRMED",
  ).length;

  const filteredBookings = bookings.filter((b) => {
    const query = debouncedSearchTerm.toLowerCase();
    const matchesSearch =
      String(b.bookingId).includes(query) ||
      b.userName?.toLowerCase().includes(query) ||
      b.movieTitle?.toLowerCase().includes(query) ||
      b.theaterName?.toLowerCase().includes(query) ||
      b.screenName?.toLowerCase().includes(query) ||
      b.seatNumbers?.some((s) => s.toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === "ALL" || b.bookingStatus === statusFilter;

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
            <h1 className="text-4xl font-bold">Booking Management</h1>
            <p className="text-gray-400 mt-1">
              Audit customer reservations, monitor attendance, and process cancellations.
            </p>
          </div>

          <button
            onClick={fetchBookingsList}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-gray-300 border border-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition">
            🔄 Refresh List
          </button>
        </div>

        {/* Financial & Status Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
              Total Reservations
            </span>
            <p className="text-3xl font-extrabold text-white mt-2">
              {bookings.length}
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
              Confirmed Bookings
            </span>
            <p className="text-3xl font-extrabold text-green-400 mt-2">
              {confirmedCount}
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
              Total Revenue (Confirmed)
            </span>
            <p className="text-3xl font-extrabold text-yellow-400 mt-2">
              ₹{totalRevenue.toLocaleString()}
            </p>
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

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-yellow-400">
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">Confirmed Only</option>
              <option value="CANCELLED">Cancelled Only</option>
            </select>
          </div>

          {/* Search Bar */}
          <div className="w-full sm:w-80 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, user, movie, seats..."
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white outline-none focus:border-yellow-400 transition pr-20"
            />
            {searchTerm.trim() && searchTerm !== debouncedSearchTerm && (
              <span className="absolute right-3 top-2.5 text-xs text-yellow-400 animate-pulse">
                Filtering...
              </span>
            )}
          </div>
        </div>

        {/* Bookings Table / List */}
        {loading ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg">Loading bookings registry...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-slate-800 border border-slate-700 rounded-2xl">
            <div className="text-5xl mb-3">📊</div>
            <p className="text-gray-400 text-lg">
              {searchTerm || statusFilter !== "ALL"
                ? "No reservations match your search or filter."
                : "No customer bookings have been placed yet."}
            </p>
          </div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-gray-400 border-b border-slate-700">
                  <tr>
                    <th className="py-4 px-6">Booking ID</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Movie</th>
                    <th className="py-4 px-6">Venue & Screen</th>
                    <th className="py-4 px-6">Showtime</th>
                    <th className="py-4 px-6">Seats</th>
                    <th className="py-4 px-6">Total Amount</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {filteredBookings.map((b) => {
                    const isConfirmed = b.bookingStatus === "CONFIRMED";
                    return (
                      <tr
                        key={b.bookingId}
                        className="hover:bg-slate-700/30 transition">
                        <td className="py-4 px-6 font-bold text-yellow-400">
                          #{b.bookingId}
                        </td>
                        <td className="py-4 px-6 font-medium text-white">
                          {b.userName || "Customer"}
                        </td>
                        <td className="py-4 px-6 font-semibold text-white">
                          {b.movieTitle}
                        </td>
                        <td className="py-4 px-6">
                          <span className="block font-medium text-white">
                            {b.screenName}
                          </span>
                          <span className="text-xs text-gray-400">
                            {b.theaterName}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs font-medium text-gray-200">
                          {b.showDateTime ? (
                            new Date(b.showDateTime).toLocaleString([], {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {b.seatNumbers?.map((s) => (
                              <span
                                key={s}
                                className="bg-blue-600/30 border border-blue-500/40 text-blue-300 px-2 py-0.5 rounded text-xs font-semibold">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-bold text-red-400 text-base">
                          ₹{b.totalAmount}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                              isConfirmed
                                ? "bg-green-500/20 text-green-400 border border-green-500/40"
                                : "bg-red-500/20 text-red-400 border border-red-500/40"
                            }`}>
                            ● {b.bookingStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {isConfirmed ? (
                            <button
                              onClick={() => handleCancelBooking(b)}
                              disabled={cancellingId === b.bookingId}
                              className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 px-3 py-1.5 rounded-lg font-semibold text-xs transition disabled:opacity-50">
                              {cancellingId === b.bookingId
                                ? "Cancelling..."
                                : "Cancel"}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-500 italic">
                              Cancelled
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBookings;
