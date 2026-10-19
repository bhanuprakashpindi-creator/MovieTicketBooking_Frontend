import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBookings, cancelBooking } from "../../api/bookingApi";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState({ type: "", text: "" });
  const [cancellingId, setCancellingId] = useState(null);
  const [filterTab, setFilterTab] = useState("ALL"); // ALL, UPCOMING, PAST

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getMyBookings();
      setBookings(response.data || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError("Failed to load your reservations. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking? This will release your reserved seats immediately."
    );
    if (!confirmCancel) return;

    try {
      setCancellingId(bookingId);
      setActionMessage({ type: "", text: "" });
      await cancelBooking(bookingId);

      setBookings((prev) =>
        prev.map((b) =>
          b.bookingId === bookingId ? { ...b, bookingStatus: "CANCELLED" } : b
        )
      );
      setActionMessage({
        type: "success",
        text: `Booking #${bookingId} was successfully cancelled.`,
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

  // Filter bookings based on selected tab
  const filteredBookings = bookings.filter((b) => {
    const isFuture = new Date(b.showDateTime) > now;
    if (filterTab === "UPCOMING") return isFuture && b.bookingStatus === "CONFIRMED";
    if (filterTab === "PAST") return !isFuture || b.bookingStatus === "CANCELLED";
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 bg-bg-surface rounded-xl w-48 mx-auto" />
          <div className="h-4 bg-bg-surface rounded-md w-64 mx-auto" />
          <div className="space-y-4 pt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-bg-surface border border-border rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary px-4 sm:px-6 py-10 sm:py-14">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-accent-primary/10 border border-accent-primary/30 px-3.5 py-1 rounded-full text-xs font-bold text-accent-primary uppercase tracking-widest mb-3">
            Ticket Wallet
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">
            My Bookings
          </h1>
          <p className="text-text-secondary text-sm sm:text-base mt-1">
            Access your active cinema tickets, view show details, and manage reservations.
          </p>
        </div>

        {/* FEEDBACK BANNER */}
        {actionMessage.text && (
          <div
            className={`p-4 rounded-xl text-sm border flex items-center justify-between ${
              actionMessage.type === "success"
                ? "bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald"
                : "bg-accent-primary/10 border-accent-primary/30 text-accent-primary"
            }`}
          >
            <span>{actionMessage.text}</span>
            <button
              onClick={() => setActionMessage({ type: "", text: "" })}
              className="text-xs font-bold underline hover:no-underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-accent-primary/10 border border-accent-primary/30 text-accent-primary rounded-xl text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchBookings}
              className="text-xs font-bold underline hover:no-underline ml-4"
            >
              Retry
            </button>
          </div>
        )}

        {/* FILTER TABS */}
        {bookings.length > 0 && (
          <div className="flex items-center justify-center gap-2 bg-bg-surface border border-border p-1.5 rounded-2xl max-w-sm mx-auto text-xs font-semibold">
            {[
              { id: "ALL", label: `All (${bookings.length})` },
              {
                id: "UPCOMING",
                label: `Upcoming (${
                  bookings.filter(
                    (b) => new Date(b.showDateTime) > now && b.bookingStatus === "CONFIRMED"
                  ).length
                })`,
              },
              { id: "PAST", label: "Past / Cancelled" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`flex-1 py-2 px-3 rounded-xl transition ${
                  filterTab === tab.id
                    ? "bg-accent-primary text-white shadow-button"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {bookings.length === 0 ? (
          <div className="text-center bg-bg-surface border border-border rounded-3xl py-16 px-6 max-w-lg mx-auto shadow-card">
            <div className="text-5xl mb-4">🎟️</div>
            <h3 className="text-xl font-bold text-text-primary mb-2">No Bookings Yet</h3>
            <p className="text-text-muted text-sm mb-6">
              You haven't booked any movie tickets yet. Explore current blockbusters and reserve your seats now!
            </p>
            <Link
              to="/movies"
              className="inline-block px-8 py-3.5 bg-accent-primary hover:bg-accent-hover text-white rounded-xl font-bold text-sm shadow-button transition"
            >
              Browse Movies
            </Link>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 text-text-muted text-sm bg-bg-surface border border-border rounded-2xl">
            No bookings found in this category.
          </div>
        ) : (
          /* BOOKINGS LIST */
          <div className="space-y-6">
            {filteredBookings.map((booking) => {
              const showTime = new Date(booking.showDateTime);
              const isFuture = now < showTime;
              const canCancel = isFuture && booking.bookingStatus === "CONFIRMED";

              const formattedDate = showTime.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const formattedTime = showTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={booking.bookingId}
                  className="bg-bg-surface border border-border hover:border-border/80 rounded-3xl p-6 sm:p-7 shadow-card transition-all duration-300"
                >
                  {/* Top: Booking ID & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
                    <div>
                      <span className="text-xs font-bold text-accent-gold uppercase tracking-wider">
                        Booking Reference #{booking.bookingId}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-text-primary mt-0.5">
                        {booking.movieTitle}
                      </h2>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase inline-flex items-center gap-1.5 ${
                        booking.bookingStatus === "CONFIRMED"
                          ? "bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30"
                          : "bg-accent-primary/15 text-accent-primary border border-accent-primary/30"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          booking.bookingStatus === "CONFIRMED"
                            ? "bg-accent-emerald"
                            : "bg-accent-primary"
                        }`}
                      />
                      {booking.bookingStatus}
                    </span>
                  </div>

                  {/* Middle: Cinema Details & Showtime */}
                  <div className="grid sm:grid-cols-2 gap-4 py-5 text-sm">
                    <div>
                      <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                        Cinema & Screen
                      </p>
                      <p className="font-semibold text-text-primary mt-1">
                        🏛️ {booking.theaterName || "Cinema Hall"}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        🎬 {booking.screenName || "Screen"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                        Date & Showtime
                      </p>
                      <p className="font-semibold text-text-primary mt-1">
                        📅 {formattedDate}
                      </p>
                      <p className="text-xs text-accent-gold font-bold mt-0.5">
                        ⏰ {formattedTime}
                      </p>
                    </div>
                  </div>

                  {/* Seats badges */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2">
                      Reserved Seats ({booking.seatNumbers?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {booking.seatNumbers?.map((seat) => (
                        <span
                          key={seat}
                          className="px-3 py-1 bg-bg-elevated border border-border text-text-primary rounded-xl text-xs font-bold"
                        >
                          💺 {seat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer Bar: Total & Cancel action */}
                  <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                        Total Amount Paid
                      </p>
                      <p className="text-2xl font-black text-accent-primary mt-0.5">
                        ₹{booking.totalAmount}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {canCancel && (
                        <button
                          onClick={() => handleCancelBooking(booking.bookingId)}
                          disabled={cancellingId === booking.bookingId}
                          className="px-4 py-2.5 bg-accent-primary/10 hover:bg-accent-primary border border-accent-primary/30 text-accent-primary hover:text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                        >
                          {cancellingId === booking.bookingId
                            ? "Cancelling..."
                            : "Cancel Reservation"}
                        </button>
                      )}
                    </div>
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
