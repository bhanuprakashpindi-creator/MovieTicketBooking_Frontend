import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getAllTheaters } from "../../api/theaterApi";

function Theaters() {
  const { movieId } = useParams();

  const [theaters, setTheaters] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        const response = await getAllTheaters();

        console.log("THEATERS:", response.data);

        setTheaters(response.data);
      } catch (error) {
        console.error("Failed to load theaters:", error);

        setError("Failed to load theaters.");
      } finally {
        setLoading(false);
      }
    };

    fetchTheaters();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-xl">Loading theaters...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-red-400 flex items-center justify-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}

        <div className="mb-10">
          <p className="text-red-500 font-semibold uppercase tracking-wider">
            Choose Your Theater
          </p>

          <h1 className="text-4xl font-bold mt-2">Select Theater</h1>

          <p className="text-gray-400 mt-3">
            Choose where you want to watch the movie.
          </p>
        </div>

        {/* THEATERS */}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {theaters.map((theater) => (
            <Link
              key={theater.theaterId}
              to={`/movies/${movieId}/theaters/${theater.theaterId}`}
              className="group">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg hover:border-red-500 hover:-translate-y-1 transition duration-300">
                {/* ICON */}

                <div className="w-14 h-14 bg-red-600/20 text-red-500 rounded-xl flex items-center justify-center text-2xl mb-5">
                  🎭
                </div>

                {/* NAME */}

                <h2 className="text-2xl font-bold group-hover:text-red-500 transition">
                  {theater.theaterName}
                </h2>

                {/* LOCATION */}

                <p className="text-gray-300 mt-3">
                  📍 {theater.city}, {theater.state}
                </p>

                {/* ADDRESS */}

                <p className="text-gray-400 text-sm mt-2">{theater.address}</p>

                {/* STATUS */}

                <div className="mt-5 flex items-center justify-between">
                  <span className="text-green-400 text-sm">
                    ● {theater.status}
                  </span>

                  <span className="text-red-500 font-semibold">Select →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Theaters;
