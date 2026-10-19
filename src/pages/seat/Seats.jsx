import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

        console.log("SHOW:", showResponse.data);

        console.log("SHOW SEATS:", seatsResponse.data);

        setShow(showResponse.data);

        setSeats(seatsResponse.data);
      } catch (error) {
        console.error("Failed to load booking data:", error);

        setError("Failed to load show and seats.");
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
    if (seat.seatStatus === "BOOKED") {
      return;
    }

    setSelectedSeats((previous) => {
      const alreadySelected = previous.some(
        (selected) => selected.seatId === seat.seatId,
      );

      if (alreadySelected) {
        return previous.filter((selected) => selected.seatId !== seat.seatId);
      }

      return [...previous, seat];
    });
  };

  // =====================================================
  // CHECK SELECTED
  // =====================================================

  const isSelected = (seatId) => {
    return selectedSeats.some((seat) => seat.seatId === seatId);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-xl">Loading seats...</p>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-red-400 flex items-center justify-center">
        <p>{error}</p>
      </div>
    );
  }

  // =====================================================
  // GROUP SEATS BY ROW
  // =====================================================

  const seatRows = seats.reduce((rows, seat) => {
    const row = seat.seatNumber.charAt(0);

    if (!rows[row]) {
      rows[row] = [];
    }

    rows[row].push(seat);

    return rows;
  }, {});

  // =====================================================
  // TOTAL
  // =====================================================

  const totalAmount = selectedSeats.length * (show?.ticketPrice || 0);

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-900 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* ================= HEADER ================= */}

        <div className="text-center mb-10">
          <p className="text-red-500 font-semibold uppercase tracking-wider">
            Select Your Seats
          </p>

          <h1 className="text-4xl font-bold mt-2">{show?.movieTitle}</h1>

          <p className="text-gray-400 mt-3">{show?.screenName}</p>

          <p className="text-gray-400">Ticket Price: ₹{show?.ticketPrice}</p>
        </div>

        {/* ================= SCREEN ================= */}

        <div className="mb-12">
          <div className="w-full max-w-3xl mx-auto">
            <div className="h-3 bg-white rounded-full shadow-lg"></div>

            <p className="text-center text-gray-400 mt-3 tracking-widest">
              SCREEN
            </p>
          </div>
        </div>

        {/* ================= SEATS ================= */}

        <div className="space-y-5">
          {Object.entries(seatRows).map(([row, rowSeats]) => (
            <div key={row} className="flex justify-center items-center gap-3">
              {/* ROW LABEL */}

              <span className="w-6 text-gray-500 font-semibold">{row}</span>

              {/* SEATS */}

              {rowSeats.map((seat) => {
                const booked = seat.seatStatus === "BOOKED";

                const selected = isSelected(seat.seatId);

                return (
                  <button
                    key={seat.seatId}
                    disabled={booked}
                    onClick={() => handleSeatClick(seat)}
                    className={`
                        w-11
                        h-11
                        rounded-lg
                        text-xs
                        font-semibold
                        transition

                        ${booked
                        ? "bg-red-600 cursor-not-allowed"
                        : selected
                          ? "bg-blue-600 scale-110"
                          : "bg-green-600 hover:bg-green-500 hover:scale-105"
                      }
                      `}>
                    {seat.seatNumber}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* ================= LEGEND ================= */}

        <div className="flex justify-center flex-wrap gap-8 mt-12 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-600 rounded"></span>
            Available
          </div>

          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-blue-600 rounded"></span>
            Selected
          </div>

          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-red-600 rounded"></span>
            Booked
          </div>
        </div>

        {/* ================= SUMMARY ================= */}

        <div className="mt-12 bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            {/* SELECTED COUNT */}

            <div>
              <p className="text-gray-400">Selected Seats</p>

              <p className="text-2xl font-bold mt-1">{selectedSeats.length}</p>
            </div>

            {/* SEAT NUMBERS */}

            <div>
              <p className="text-gray-400">Seats</p>

              <p className="text-lg font-semibold mt-1">
                {selectedSeats.length > 0
                  ? selectedSeats.map((seat) => seat.seatNumber).join(", ")
                  : "None"}
              </p>
            </div>

            {/* TOTAL */}

            <div>
              <p className="text-gray-400">Total Amount</p>

              <p className="text-3xl font-bold text-red-500 mt-1">
                ₹{totalAmount}
              </p>
            </div>
          </div>

          {/* BUTTON */}

          <button
            disabled={selectedSeats.length === 0}
            onClick={() => {
              const showId = selectedSeats.map(seat => seat.showSeatId)

              navigate(`/booking/${showId}`, {
                state: {
                  show,
                  selectedSeats,
                  totalAmount,
                },
              });
            }}
            className="w-full mt-8 px-8 py-4 bg-red-600 rounded-lg font-semibold text-lg hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed">
            Proceed to Booking →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Seats;
