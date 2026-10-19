import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { getMovieById } from "../../api/movieApi";

function MovieDetails() {
  const { movieId } = useParams();

  const [movie, setMovie] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await getMovieById(movieId);

        console.log("MOVIE DETAILS:", response.data);

        setMovie(response.data);
      } catch (error) {
        console.error("Failed to load movie:", error);

        setError("Movie not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [movieId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-xl">Loading movie...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-slate-900 text-red-400 flex items-center justify-center">
        <p>{error || "Movie not found."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <Link to="/movies" className="text-gray-400 hover:text-white">
          ← Back to Movies
        </Link>

        <div className="mt-8 bg-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="grid md:grid-cols-3">
            {/* Poster */}

            <div className="h-[500px] bg-slate-700">
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.movieTitle}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Poster
                </div>
              )}
            </div>

            {/* Details */}

            <div className="md:col-span-2 p-8">
              <p className="text-red-500 uppercase tracking-wider font-semibold">
                Movie
              </p>

              <h1 className="text-4xl font-bold mt-2">{movie.movieTitle}</h1>

              <div className="flex flex-wrap gap-3 mt-5">
                <span className="bg-slate-700 px-3 py-1 rounded-full">
                  {movie.genre}
                </span>

                <span className="bg-slate-700 px-3 py-1 rounded-full">
                  {movie.language}
                </span>

                <span className="bg-slate-700 px-3 py-1 rounded-full">
                  {movie.certificate}
                </span>
              </div>

              <div className="mt-6 text-yellow-400 text-lg">
                ⭐ {movie.rating}
              </div>

              <p className="text-gray-300 leading-7 mt-6">
                {movie.description}
              </p>

              <Link
                to={`/movies/${movie.movieId}/theaters`}
                className="inline-block mt-8 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition">
                Book Tickets
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetails;
