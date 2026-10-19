import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getShowsByMovie } from "../../api/showApi";

function Shows() {
  const { movieId } = useParams();

  const navigate = useNavigate();

  const [shows, setShows] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // FETCH SHOWS
  // =====================================================

  useEffect(() => {
    const fetchShows = async () => {
      try {
        setLoading(true);

        const response = await getShowsByMovie(movieId);

        console.log("MOVIE SHOWS:", response.data);

        setShows(response.data || []);
      } catch (err) {
        console.error("Failed to load shows:", err);

        setError("Failed to load shows.");
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [movieId]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-xl">Loading shows...</p>
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
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-900 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}

        <div className="mb-10">
          <p className="text-red-500 font-semibold uppercase tracking-wider">
            Choose Your Show
          </p>

          <h1 className="text-4xl font-bold mt-2">Available Shows</h1>

          {shows.length > 0 && (
            <p className="text-gray-400 mt-3">{shows[0].movieTitle}</p>
          )}
        </div>

        {/* NO SHOWS */}

        {shows.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">
              No shows available for this movie.
            </p>

            <button
              onClick={() => navigate("/movies")}
              className="mt-6 px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition">
              Back to Movies
            </button>
          </div>
        ) : (
          /* SHOW CARDS */

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shows.map((show) => (
              <div
                key={show.showId}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-red-500 transition">
                {/* SCREEN */}

                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">{show.screenName}</h2>

                  <span className="text-green-400 text-sm">
                    ● {show.showStatus}
                  </span>
                </div>

                {/* DATE */}

                <div className="mt-6">
                  <p className="text-gray-400 text-sm">Show Date</p>

                  <p className="text-lg font-semibold mt-1">
                    {new Date(show.showDateTime).toLocaleDateString()}
                  </p>
                </div>

                {/* TIME */}

                <div className="mt-4">
                  <p className="text-gray-400 text-sm">Show Time</p>

                  <p className="text-2xl font-bold text-red-500 mt-1">
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

                {/* SELECT SHOW */}

                <button
                  onClick={() => navigate(`/shows/${show.showId}`)}
                  className="w-full mt-6 px-5 py-3 bg-red-600 rounded-lg font-semibold hover:bg-red-700 transition">
                  Select Show
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Shows;
