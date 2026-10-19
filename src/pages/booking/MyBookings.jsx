import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBookings, cancelBooking } from "../../api/bookingApi";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getMyBookings();
      console.log("BOOKINGS:", response.data);
      setBookings(response.data || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError("Failed to load your bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking? This action cannot be undone.",
    );
    if (!confirmCancel) return;

    try {
      setCancellingId(bookingId);
      setActionMessage({ type: "", text: "" });
      const response = await cancelBooking(bookingId);
      console.log("Cancelled Booking:", response.data);

      setBookings((prev) =>
        prev.filter((booking) => booking.bookingId !== bookingId),
      );
      setActionMessage({
        type: "success",
        text: `Booking #${bookingId} has been successfully cancelled.`,
      });
    } catch (err) {
      console.error("Failed to cancel the booking:", err);
      setActionMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Failed to cancel booking. It may have already started or cannot be cancelled.",
      });
    } finally {
      setCancellingId(null);
    }
  };

  const now = new Date();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-slate-900 text-white flex items-center justify-center">
        <p className="text-xl text-gray-400">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-900 text-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <p className="text-red-500 font-semibold uppercase tracking-wider">
            History
          </p>
          <h1 className="text-4xl font-bold mt-2">My Bookings</h1>
          <p className="text-gray-400 mt-2">
            View your upcoming and past movie ticket reservations.
          </p>
        </div>

        {actionMessage.text && (
          <div
            className={`mb-6 p-4 rounded-xl border ${
              actionMessage.type === "success"
                ? "bg-green-500/10 border-green-500 text-green-400"
                : "bg-red-500/10 border-red-500 text-red-400"
            }`}>
            {actionMessage.text}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 text-red-400 rounded-xl">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center bg-slate-800 border border-slate-700 rounded-2xl py-16 px-6">
            <div className="text-5xl mb-4">🎟️</div>
            <h3 className="text-xl font-semibold mb-2">No Bookings Found</h3>
            <p className="text-gray-400 mb-6">
              You haven't booked any movie tickets yet.
            </p>
            <Link
              to="/movies"
              className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition">
              Explore Movies
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const showTime = new Date(booking.showDateTime);
              const canCancel =
                now < showTime && booking.bookingStatus === "CONFIRMED";

              return (
                <div
                  key={booking.bookingId}
                  className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg hover:border-slate-600 transition">
                  {/* Header */}
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-5 border-b border-slate-700/80 pb-4">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-red-500 font-semibold">
                        Booking #{booking.bookingId}
                      </span>
                      <h2 className="text-2xl font-bold mt-1 text-white">
                        {booking.movieTitle}
                      </h2>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        booking.bookingStatus === "CONFIRMED"
                          ? "bg-green-500/20 text-green-400 border border-green-500/40"
                          : "bg-red-500/20 text-red-400 border border-red-500/40"
                      }`}>
                      {booking.bookingStatus}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-300">
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider">
                        Theater & Screen
                      </p>
                      <p className="font-semibold text-white mt-1">
                        🏢 {booking.theaterName} • 🎬 {booking.screenName}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider">
                        Show Date & Time
                      </p>
                      <p className="font-semibold text-white mt-1">
                        📅 {showTime.toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Seats */}
                  <div className="mt-5 pt-4 border-t border-slate-700/60">
                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                      Reserved Seats ({booking.seatNumbers?.length || 0})
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {booking.seatNumbers?.map((seat) => (
                        <span
                          key={seat}
                          className="bg-blue-600/30 border border-blue-500/40 text-blue-300 px-3 py-1 rounded-lg text-sm font-semibold">
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Bar */}
                  <div className="border-t border-slate-700 mt-6 pt-4 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-400">
                        Total Amount Paid
                      </p>
                      <p className="text-2xl font-bold text-red-500 mt-1">
                        ₹{booking.totalAmount}
                      </p>
                    </div>

                    {canCancel && (
                      <button
                        onClick={() => handleCancelBooking(booking.bookingId)}
                        disabled={cancellingId === booking.bookingId}
                        className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/50 px-5 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50">
                        {cancellingId === booking.bookingId
                          ? "Cancelling..."
                          : "Cancel Booking"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;
