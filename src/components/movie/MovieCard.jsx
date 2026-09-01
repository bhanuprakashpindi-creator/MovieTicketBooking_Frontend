import { Link } from "react-router-dom";

function MovieCard({ movie }) {
  return (
    <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:-translate-y-1 transition">
      <div className="h-80 bg-slate-700">
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

      <div className="p-5">
        <h2 className="text-xl font-bold text-white truncate">
          {movie.movieTitle}
        </h2>

        <p className="text-gray-400 mt-2">
          {movie.genre} • {movie.language}
        </p>

        <div className="flex items-center justify-between mt-4">
          <span className="text-yellow-400">⭐ {movie.rating}</span>

          <span className="text-gray-400">{movie.certificate}</span>
        </div>

        <Link
          to={`/movies/${movie.movieId}`}
          className="block text-center mt-5 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition">
          View Details
        </Link>
      </div>
    </div>
  );
}

export default MovieCard;
