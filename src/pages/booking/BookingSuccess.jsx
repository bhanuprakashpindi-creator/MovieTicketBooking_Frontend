import { useLocation, useNavigate } from "react-router-dom";

function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking;

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Booking information not available.</p>

          <button
            onClick={() => navigate("/movies")}
            className="mt-6 px-6 py-3 bg-red-600 rounded-lg">
            Browse Movies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
          {/* SUCCESS */}

          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-green-600/20 text-green-400 rounded-full flex items-center justify-center text-4xl">
              ✓
            </div>

            <h1 className="text-3xl font-bold mt-6">Booking Successful!</h1>

            <p className="text-gray-400 mt-2">
              Your tickets have been booked successfully.
            </p>
          </div>

          {/* BOOKING ID */}

          <div className="mt-8 bg-slate-900 rounded-xl p-5 text-center">
            <p className="text-gray-400 text-sm">Booking ID</p>

            <p className="text-2xl font-bold text-red-500 mt-1">
              #{booking.bookingId}
            </p>
          </div>

          {/* DETAILS */}

          <div className="mt-8 space-y-5">
            <div className="flex justify-between">
              <span className="text-gray-400">Movie</span>

              <span className="font-semibold">{booking.movieTitle}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Theater</span>

              <span className="font-semibold">{booking.theaterName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Screen</span>

              <span className="font-semibold">{booking.screenName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-400">Show</span>

              <span className="font-semibold">
                {new Date(booking.showDateTime).toLocaleString()}
              </span>
            </div>

            {/* SEATS */}

            <div>
              <p className="text-gray-400 mb-2">Seats</p>

              <div className="flex flex-wrap gap-2">
                {booking.seatNumbers?.map((seat) => (
                  <span
                    key={seat}
                    className="px-3 py-2 bg-blue-600 rounded-lg font-semibold">
                    {seat}
                  </span>
                ))}
              </div>
            </div>

            {/* STATUS */}

            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>

              <span className="text-green-400 font-semibold">
                {booking.bookingStatus}
              </span>
            </div>

            {/* TOTAL */}

            <div className="border-t border-slate-700 pt-5 flex justify-between">
              <span className="text-xl font-bold">Total</span>

              <span className="text-2xl font-bold text-red-500">
                ₹{booking.totalAmount}
              </span>
            </div>
          </div>

          {/* BUTTON */}

          <button
            onClick={() => navigate("/my-bookings")}
            className="w-full mt-8 py-4 bg-red-600 rounded-lg font-bold hover:bg-red-700 transition">
            View My Bookings
          </button>

          <button
            onClick={() => navigate("/movies")}
            className="w-full mt-3 py-3 bg-slate-700 rounded-lg font-semibold hover:bg-slate-600 transition">
            Browse Movies
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingSuccess;
