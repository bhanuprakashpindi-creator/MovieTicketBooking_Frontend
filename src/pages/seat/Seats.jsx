import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getShowById } from "../../api/showApi";
import { getSeatsByShow } from "../../api/seatApi";

function Seats() {
  const { showId } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH SHOW + SEATS
  // =====================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [showResponse, seatsResponse] = await Promise.all([
          getShowById(showId),
          getSeatsByShow(showId),
        ]);

        setShow(showResponse.data);
        setSeats(seatsResponse.data || []);
      } catch (err) {
        console.error("Failed to load booking data:", err);
        setError("Failed to load show and seat layout.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showId]);

  // =====================================================
  // SELECT / UNSELECT SEAT
  // =====================================================
  const handleSeatClick = (seat) => {
    if (seat.seatStatus === "BOOKED") return;

    setSelectedSeats((prev) => {
      const alreadySelected = prev.some((s) => s.seatId === seat.seatId);
      if (alreadySelected) {
        return prev.filter((s) => s.seatId !== seat.seatId);
      }
      return [...prev, seat];
    });
  };

  const isSelected = (seatId) => selectedSeats.some((s) => s.seatId === seatId);

  // =====================================================
  // LOADING STATE
  // =====================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse text-center">
          <div className="h-8 bg-bg-surface rounded-xl w-64 mx-auto" />
          <div className="h-4 bg-bg-surface rounded-md w-40 mx-auto" />
          <div className="h-6 bg-bg-surface rounded-full w-3/4 mx-auto mt-12" />
          <div className="space-y-4 pt-8">
            {[1, 2, 3, 4, 5].map((r) => (
              <div key={r} className="h-10 bg-bg-surface rounded-xl max-w-lg mx-auto" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR STATE
  // =====================================================
  if (error || !show) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center px-4">
        <div className="text-center p-8 bg-bg-surface border border-border rounded-2xl max-w-md">
          <p className="text-accent-primary font-semibold mb-4">{error || "Show not found."}</p>
          <Link
            to="/movies"
            className="inline-block px-6 py-3 bg-accent-primary hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition"
          >
            ← Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  // Group seats by Row (first character of seatNumber, e.g. A1 -> 'A')
  const seatRows = seats.reduce((rows, seat) => {
    const row = seat.seatNumber ? seat.seatNumber.charAt(0).toUpperCase() : "A";
    if (!rows[row]) rows[row] = [];
    rows[row].push(seat);
    return rows;
  }, {});

  // Sort seats in each row numerically
  Object.keys(seatRows).forEach((row) => {
    seatRows[row].sort((a, b) => {
      const numA = parseInt(a.seatNumber.replace(/^\D+/g, ""), 10) || 0;
      const numB = parseInt(b.seatNumber.replace(/^\D+/g, ""), 10) || 0;
      return numA - numB;
    });
  });

  const totalAmount = selectedSeats.length * (show?.ticketPrice || 0);

  const formattedTime = new Date(show.showDateTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedDate = new Date(show.showDateTime).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary px-4 sm:px-6 py-8 sm:py-12 pb-32">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* TOP BAR / BREADCRUMB */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-text-secondary">
          <button
            onClick={() => navigate(-1)}
            className="hover:text-text-primary transition flex items-center gap-1.5"
          >
            <span>←</span>
            <span>Back to showtimes</span>
          </button>
          <span className="text-text-muted">Step 3 of 4: Seat Selection</span>
        </div>

        {/* ================= HEADER ================= */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-accent-primary/10 border border-accent-primary/30 px-3 py-1 rounded-full text-xs font-bold text-accent-primary uppercase tracking-widest">
            {show.screenName || "Cinema Hall"}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">
            {show.movieTitle}
          </h1>
          <p className="text-text-secondary text-sm">
            {formattedDate} • <span className="text-accent-gold font-semibold">{formattedTime}</span> • ₹{show.ticketPrice} per ticket
          </p>
        </div>

        {/* ================= CINEMA SCREEN ================= */}
        <div className="pt-6 pb-2">
          <div className="w-full max-w-2xl mx-auto text-center">
            {/* Curved Screen Effect with Glow */}
            <div className="relative h-8 mx-auto overflow-hidden">
              <div className="absolute inset-x-4 top-0 h-16 border-t-4 border-accent-gold/60 rounded-[100%] shadow-[0_-8px_25px_rgba(234,179,8,0.25)]" />
            </div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-text-muted font-bold mt-1">
              All Eyes This Way • Cinema Screen
            </p>
          </div>
        </div>

        {/* ================= LEGEND ================= */}
        <div className="flex justify-center items-center flex-wrap gap-6 text-xs text-text-secondary bg-bg-surface/60 border border-border py-3 px-6 rounded-2xl max-w-xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-lg bg-bg-elevated border border-border" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-lg bg-accent-primary text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
              ✓
            </span>
            <span className="text-text-primary font-semibold">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-lg bg-bg-elevated/40 border border-border/40 opacity-40 line-through text-[10px] flex items-center justify-center text-text-muted" />
            <span className="text-text-muted">Booked</span>
          </div>
        </div>

        {/* ================= SEAT MATRIX (SCROLLABLE ON MOBILE) ================= */}
        <div className="bg-bg-surface border border-border rounded-3xl p-6 sm:p-10 shadow-card overflow-x-auto">
          <div className="min-w-fit mx-auto flex flex-col items-center space-y-3.5">
            {Object.entries(seatRows).map(([row, rowSeats]) => (
              <div key={row} className="flex items-center gap-3">
                {/* Left Row Label */}
                <span className="w-7 text-center font-bold text-xs text-text-muted">
                  {row}
                </span>

                {/* Seats in Row */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                  {rowSeats.map((seat) => {
                    const booked = seat.seatStatus === "BOOKED";
                    const selected = isSelected(seat.seatId);

                    return (
                      <button
                        key={seat.seatId}
                        type="button"
                        disabled={booked}
                        onClick={() => handleSeatClick(seat)}
                        title={`Seat ${seat.seatNumber} — ${
                          booked ? "Booked" : selected ? "Selected" : "Available"
                        }`}
                        aria-label={`Seat ${seat.seatNumber}, ${
                          booked ? "Booked" : selected ? "Selected" : "Available"
                        }`}
                        className={`
                          w-8 h-8 sm:w-10 sm:h-10
                          rounded-xl
                          text-xs
                          font-bold
                          transition-all duration-150
                          flex items-center justify-center
                          ${
                            booked
                              ? "bg-bg-elevated/30 border border-border/30 text-text-muted/30 cursor-not-allowed line-through"
                              : selected
                              ? "bg-accent-primary border-2 border-accent-primary text-white shadow-glow-red scale-105 active:scale-95"
                              : "bg-bg-elevated border border-border hover:border-accent-primary/60 text-text-secondary hover:text-text-primary hover:scale-105 active:scale-95"
                          }
                        `}
                      >
                        {seat.seatNumber}
                      </button>
                    );
                  })}
                </div>

                {/* Right Row Label */}
                <span className="w-7 text-center font-bold text-xs text-text-muted">
                  {row}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ================= STICKY SUMMARY BOTTOM BAR ================= */}
        <div className="fixed bottom-0 inset-x-0 z-40 bg-bg-surface/95 backdrop-blur-md border-t border-border p-4 sm:p-5 shadow-2xl">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Selected Seats summary */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
              <div>
                <p className="text-xs text-text-muted font-medium">Selected Seats</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-black text-text-primary">
                    {selectedSeats.length} {selectedSeats.length === 1 ? "seat" : "seats"}
                  </span>
                  {selectedSeats.length > 0 && (
                    <span className="text-xs text-accent-gold font-bold">
                      ({selectedSeats.map((s) => s.seatNumber).join(", ")})
                    </span>
                  )}
                </div>
              </div>

              <div className="sm:border-l sm:border-border sm:pl-4">
                <p className="text-xs text-text-muted font-medium">Total Price</p>
                <p className="text-2xl font-black text-accent-primary mt-0.5">
                  ₹{totalAmount}
                </p>
              </div>
            </div>

            {/* Action button */}
            <div className="w-full sm:w-auto">
              <button
                type="button"
                disabled={selectedSeats.length === 0}
                onClick={() => {
                  navigate(`/booking/${show.showId}`, {
                    state: {
                      show,
                      selectedSeats,
                      totalAmount,
                    },
                  });
                }}
                className="w-full sm:w-auto px-8 py-3.5 bg-accent-primary hover:bg-accent-hover disabled:bg-bg-elevated disabled:text-text-muted disabled:border disabled:border-border disabled:shadow-none text-white font-bold text-sm sm:text-base rounded-xl shadow-glow-red transition active:scale-95 disabled:cursor-not-allowed"
              >
                {selectedSeats.length === 0
                  ? "Select seats to proceed"
                  : `Proceed to Pay ₹${totalAmount} →`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Seats;
