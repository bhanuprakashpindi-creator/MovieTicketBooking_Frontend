import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { createBooking } from "../../api/bookingApi";

function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  const { show, selectedSeats, totalAmount } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!show || !selectedSeats || selectedSeats.length === 0) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center px-4">
        <div className="text-center p-8 bg-bg-surface border border-border rounded-2xl max-w-md shadow-card">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-xl font-bold text-text-primary mb-2">No Booking Data Found</h2>
          <p className="text-text-muted text-sm mb-6">
            Your booking session has expired or no seats were selected.
          </p>
          <Link
            to="/movies"
            className="inline-block px-6 py-3 bg-accent-primary hover:bg-accent-hover text-white rounded-xl font-semibold text-sm transition"
          >
            ← Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  const handleBooking = async () => {
    setLoading(true);
    setError("");

    try {
      const showSeatIds = selectedSeats.map((seat) => seat.showSeatId);
      const bookingRequest = {
        showId: show.showId,
        showSeatIds: showSeatIds,
      };

      const response = await createBooking(bookingRequest);

      navigate(`/booking/success/${response.data.bookingId}`, {
        state: {
          booking: response.data,
        },
      });
    } catch (err) {
      console.error("Booking Failed:", err);
      setError(
        err.response?.data?.message ||
          "Booking failed. One or more seats may have just been reserved. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = new Date(show.showDateTime).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = new Date(show.showDateTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary px-4 sm:px-6 py-10 sm:py-14">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-text-secondary">
          <button
            onClick={() => navigate(-1)}
            className="hover:text-text-primary transition flex items-center gap-1"
          >
            <span>←</span>
            <span>Modify Seats</span>
          </button>
          <span className="text-text-muted">/</span>
          <span className="text-text-muted">Final Review & Payment</span>
        </div>

        {/* HEADER */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-accent-gold/10 border border-accent-gold/30 px-3.5 py-1 rounded-full text-xs font-bold text-accent-gold uppercase tracking-widest mb-3">
            Final Step
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">
            Order Summary
          </h1>
          <p className="text-text-secondary text-sm sm:text-base mt-1">
            Please review your cinema ticket details before confirming your reservation.
          </p>
        </div>

        {/* TICKET SUMMARY CARD */}
        <div className="bg-bg-surface border border-border rounded-3xl overflow-hidden shadow-card">
          {/* Header ribbon */}
          <div className="bg-bg-elevated px-6 sm:px-8 py-5 border-b border-border flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-accent-primary font-bold">
                Screening
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-text-primary mt-0.5">
                {show.movieTitle}
              </h2>
            </div>
            <span className="text-xs bg-bg-surface border border-border px-3 py-1 rounded-lg text-text-secondary font-medium">
              🎬 {show.screenName || "Auditorium"}
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Show Details Grid */}
            <div className="grid sm:grid-cols-2 gap-4 bg-bg-elevated/50 p-4 sm:p-5 rounded-2xl border border-border/80">
              <div>
                <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                  Date
                </p>
                <p className="font-bold text-text-primary text-sm sm:text-base mt-1">
                  📅 {formattedDate}
                </p>
              </div>

              <div>
                <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
                  Showtime
                </p>
                <p className="font-bold text-accent-gold text-sm sm:text-base mt-1">
                  ⏰ {formattedTime}
                </p>
              </div>
            </div>

            {/* Seats Assigned */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
                  Reserved Seats ({selectedSeats.length})
                </span>
                <span className="text-xs text-text-secondary font-semibold">
                  Standard Seat Reservation
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedSeats.map((seat) => (
                  <span
                    key={seat.showSeatId || seat.seatId}
                    className="px-3.5 py-1.5 bg-accent-primary/10 border border-accent-primary/30 text-accent-primary rounded-xl font-bold text-sm flex items-center gap-1.5"
                  >
                    <span>💺</span>
                    <span>{seat.seatNumber}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-border pt-6 space-y-3">
              <div className="flex justify-between text-sm text-text-secondary">
                <span>Ticket Price (x{selectedSeats.length})</span>
                <span className="font-medium text-text-primary">
                  {selectedSeats.length} × ₹{show.ticketPrice}
                </span>
              </div>

              <div className="flex justify-between text-sm text-text-secondary">
                <span>Convenience / Platform Fee</span>
                <span className="font-medium text-accent-emerald">FREE</span>
              </div>

              <div className="border-t border-border pt-4 flex justify-between items-center">
                <div>
                  <span className="text-lg font-bold text-text-primary block">Total Payable</span>
                  <span className="text-xs text-text-muted">Includes all taxes and surcharges</span>
                </div>
                <span className="text-3xl font-black text-accent-primary">
                  ₹{totalAmount}
                </span>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-4 bg-accent-primary/10 border border-accent-primary/30 rounded-xl text-accent-primary text-sm flex items-start gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Confirm CTA */}
            <button
              onClick={handleBooking}
              disabled={loading}
              className="w-full py-4 bg-accent-primary hover:bg-accent-hover text-white rounded-2xl font-bold text-base shadow-glow-red transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Confirming Reservation...</span>
                </>
              ) : (
                <>
                  <span>🔒</span>
                  <span>Confirm & Complete Booking (₹{totalAmount})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingConfirmation;
