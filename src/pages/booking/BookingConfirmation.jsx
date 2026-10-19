import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { createBooking } from "../../api/bookingApi";

function BookingConfirmation() {
  const location = useLocation();

  const navigate = useNavigate();

  const { show, selectedSeats, totalAmount } = location.state || {};

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // SAFETY CHECK
  // =====================================================

  if (!show || !selectedSeats) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-400">
            Booking information not found.
          </p>

          <button
            onClick={() => navigate("/movies")}
            className="mt-6 px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700">
            Back to Movies
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // CONFIRM BOOKING
  // =====================================================

  const handleBooking = async () => {
    setLoading(true);

    setError("");

    try {
      /*
       * IMPORTANT:
       *
       * Backend expects:
       *
       * showSeatIds
       *
       * Therefore we use showSeatId,
       * NOT seatId.
       */

      const showSeatIds = selectedSeats.map((seat) => seat.showSeatId);

      const bookingRequest = {
        showId: show.showId,

        showSeatIds: showSeatIds,
      };

      console.log("BOOKING REQUEST:", bookingRequest);

      const response = await createBooking(bookingRequest);

      console.log("BOOKING RESPONSE:", response.data);

      // Send booking response to success page

      navigate(`/booking/success/${response.data.bookingId}`, {
        state: {
          booking: response.data,
        },
      });
    } catch (error) {
      console.error("Booking Failed:", error);

      console.error("Backend Error:", error.response?.data);

      setError(
        error.response?.data?.message || "Booking failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-900 text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}

        <div className="text-center mb-10">
          <p className="text-red-500 font-semibold uppercase tracking-wider">
            Almost Done
          </p>

          <h1 className="text-4xl font-bold mt-2">Confirm Your Booking</h1>
        </div>

        {/* BOOKING CARD */}

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
          {/* MOVIE */}

          <div className="border-b border-slate-700 pb-6">
            <p className="text-gray-400 text-sm">Movie</p>

            <h2 className="text-2xl font-bold mt-1">{show.movieTitle}</h2>
          </div>

          {/* SHOW */}

          <div className="grid sm:grid-cols-2 gap-6 py-6 border-b border-slate-700">
            <div>
              <p className="text-gray-400 text-sm">Screen</p>

              <p className="font-semibold mt-1">{show.screenName}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm">Show Time</p>

              <p className="font-semibold mt-1">
                {new Date(show.showDateTime).toLocaleString()}
              </p>
            </div>
          </div>

          {/* SEATS */}

          <div className="py-6 border-b border-slate-700">
            <p className="text-gray-400 text-sm">Selected Seats</p>

            <div className="flex flex-wrap gap-2 mt-3">
              {selectedSeats.map((seat) => (
                <span
                  key={seat.showSeatId}
                  className="px-3 py-2 bg-blue-600 rounded-lg font-semibold">
                  {seat.seatNumber}
                </span>
              ))}
            </div>
          </div>

          {/* PRICE */}

          <div className="py-6">
            <div className="flex justify-between">
              <span className="text-gray-400">Ticket Price</span>

              <span>₹{show.ticketPrice}</span>
            </div>

            <div className="flex justify-between mt-3">
              <span className="text-gray-400">Number of Seats</span>

              <span>{selectedSeats.length}</span>
            </div>

            <div className="flex justify-between mt-6 pt-6 border-t border-slate-700">
              <span className="text-xl font-bold">Total</span>

              <span className="text-2xl font-bold text-red-500">
                ₹{totalAmount}
              </span>
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-5 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* CONFIRM */}

          <button
            onClick={handleBooking}
            disabled={loading}
            className="w-full py-4 bg-red-600 rounded-lg font-bold text-lg hover:bg-red-700 transition disabled:opacity-50">
            {loading ? "Processing Booking..." : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingConfirmation;
