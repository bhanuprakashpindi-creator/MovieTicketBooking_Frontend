import { useLocation, useNavigate, Link } from "react-router-dom";

function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking;

  if (!booking) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center px-4">
        <div className="text-center p-8 bg-bg-surface border border-border rounded-2xl max-w-md shadow-card">
          <p className="text-text-muted text-base mb-6">Booking information is not available.</p>
          <button
            onClick={() => navigate("/movies")}
            className="px-6 py-3 bg-accent-primary hover:bg-accent-hover text-white rounded-xl font-semibold text-sm transition"
          >
            Browse Movies
          </button>
        </div>
      </div>
    );
  }

  const showDate = new Date(booking.showDateTime);
  const formattedDate = showDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = showDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary px-4 sm:px-6 py-10 sm:py-14 print:bg-white print:text-black print:p-0">
      <div className="max-w-xl mx-auto space-y-8">
        {/* SUCCESS BADGE */}
        <div className="text-center space-y-3 print:hidden">
          <div className="w-16 h-16 mx-auto bg-accent-emerald/10 border-2 border-accent-emerald/40 text-accent-emerald rounded-full flex items-center justify-center text-3xl shadow-lg">
            ✓
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">
            Booking Confirmed!
          </h1>
          <p className="text-text-secondary text-sm">
            Your movie tickets are reserved. Show this digital pass at the cinema hall.
          </p>
        </div>

        {/* ================= DIGITAL CINEMA PASS (TICKET STUB) ================= */}
        <div className="relative bg-bg-surface border border-border rounded-3xl overflow-hidden shadow-2xl print:border-black print:shadow-none">
          {/* Top Header of Ticket */}
          <div className="bg-gradient-to-r from-accent-primary to-accent-hover p-6 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-[11px] uppercase tracking-widest font-black opacity-80">
                Official Digital Cinema Pass
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                {booking.movieTitle}
              </h2>
              <p className="text-xs opacity-90 mt-1 font-medium">
                {booking.theaterName} • {booking.screenName}
              </p>
            </div>
            {/* Background cinema watermark */}
            <span className="absolute -right-4 -bottom-4 text-7xl opacity-10 pointer-events-none">
              🎬
            </span>
          </div>

          {/* Ticket Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Booking ID & Status */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <p className="text-xs uppercase tracking-wider text-text-muted font-medium">
                  Booking Reference
                </p>
                <p className="text-lg font-black text-accent-gold mt-0.5">
                  #{booking.bookingId}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald" />
                {booking.bookingStatus || "CONFIRMED"}
              </span>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-text-muted font-medium">
                  Date
                </p>
                <p className="font-bold text-text-primary text-sm sm:text-base mt-1">
                  📅 {formattedDate}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-text-muted font-medium">
                  Time
                </p>
                <p className="font-bold text-text-primary text-sm sm:text-base mt-1">
                  ⏰ {formattedTime}
                </p>
              </div>
            </div>

            {/* Seats Assigned */}
            <div>
              <p className="text-xs uppercase tracking-wider text-text-muted font-medium mb-2">
                Seats Reserved ({booking.seatNumbers?.length || 0})
              </p>
              <div className="flex flex-wrap gap-2">
                {booking.seatNumbers?.map((seat) => (
                  <span
                    key={seat}
                    className="px-3.5 py-1.5 bg-bg-elevated border border-border text-text-primary font-bold rounded-xl text-sm"
                  >
                    💺 {seat}
                  </span>
                ))}
              </div>
            </div>

            {/* Perforated divider line with ticket cutouts */}
            <div className="relative my-4">
              <div className="border-t-2 border-dashed border-border" />
            </div>

            {/* Total & Barcode Simulation */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-text-muted font-medium">
                  Total Paid
                </p>
                <p className="text-2xl font-black text-accent-primary mt-0.5">
                  ₹{booking.totalAmount}
                </p>
              </div>

              {/* Barcode / QR Simulation */}
              <div className="text-right">
                <div className="inline-flex items-center gap-0.5 tracking-tighter font-mono text-2xl text-text-muted select-none opacity-70">
                  ||||| | |||| ||| |||||
                </div>
                <p className="text-[10px] text-text-muted font-mono mt-0.5">
                  SCAN AT GATE
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="space-y-3 print:hidden">
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 py-3.5 bg-bg-surface hover:bg-bg-elevated border border-border hover:border-text-muted text-text-primary rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              <span>🖨️</span>
              <span>Print Ticket</span>
            </button>

            <Link
              to="/my-bookings"
              className="flex-1 py-3.5 bg-accent-primary hover:bg-accent-hover text-white rounded-xl font-bold text-sm text-center shadow-button transition flex items-center justify-center gap-2"
            >
              <span>🎟️</span>
              <span>My Bookings</span>
            </Link>
          </div>

          <Link
            to="/movies"
            className="block text-center py-2.5 text-xs text-text-muted hover:text-text-primary transition"
          >
            ← Browse More Movies
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BookingSuccess;
