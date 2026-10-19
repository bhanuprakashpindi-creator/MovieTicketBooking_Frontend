import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getShowsByMovieAndTheaterAndDate } from "../../api/showApi";

function TheaterShows() {
  const { movieId, theaterId } = useParams();

  const navigate = useNavigate();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const [shows, setShows] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const fetchShows = async (selectedDate) => {
    setLoading(true);
    setError("");

    try {
      const response = await getShowsByMovieAndTheaterAndDate(
        movieId,
        theaterId,
        selectedDate,
      );

      console.log("SHOWS:", response.data);

      setShows(response.data);
    } catch (error) {
      console.error("Failed to load shows:", error);

      setShows([]);

      setError("Failed to load shows.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShows(date);
  }, [movieId, theaterId, date]);

  const handleDateChange = (event) => {
    setDate(event.target.value);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}

        <div className="mb-10">
          <p className="text-red-500 font-semibold uppercase tracking-wider">
            Choose Your Show
          </p>

          <h1 className="text-4xl font-bold mt-2">Select Date & Show</h1>

          <p className="text-gray-400 mt-3">
            Select a date to view available show timings.
          </p>
        </div>

        {/* DATE */}

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-10">
          <label className="block text-gray-400 mb-3">Select Date</label>

          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            className="px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white outline-none focus:border-red-500"
          />
        </div>

        {/* LOADING */}

        {loading && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-400">Loading shows...</p>
          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="text-center py-16">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* NO SHOWS */}

        {!loading && !error && shows.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-400">
              No shows available for this date.
            </p>

            <p className="text-gray-500 mt-2">Try selecting another date.</p>
          </div>
        )}

        {/* SHOWS */}

        {!loading && shows.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Available Shows</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {shows.map((show) => (
                <div
                  key={show.showId}
                  className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-red-500 transition">
                  {/* MOVIE */}

                  <h3 className="text-xl font-bold">{show.movieTitle}</h3>

                  {/* SCREEN */}

                  <p className="text-gray-400 mt-3">🎬 {show.screenName}</p>

                  {/* TIME */}

                  <div className="mt-5">
                    <p className="text-gray-400 text-sm">Show Time</p>

                    <p className="text-3xl font-bold text-red-500 mt-1">
                      {new Date(show.showDateTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {/* PRICE */}

                  <div className="mt-4">
                    <p className="text-gray-400 text-sm">Ticket Price</p>

                    <p className="text-xl font-semibold mt-1">
                      ₹{show.ticketPrice}
                    </p>
                  </div>

                  {/* STATUS */}

                  <div className="mt-4">
                    <span className="text-green-400 text-sm">
                      ● {show.showStatus}
                    </span>
                  </div>

                  {/* SELECT */}

                  <button
                    onClick={() => navigate(`/shows/${show.showId}`)}
                    className="w-full mt-6 px-5 py-3 bg-red-600 rounded-lg font-semibold hover:bg-red-700 transition">
                    Select Show →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TheaterShows;
