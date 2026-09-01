import MovieCard from "./MovieCard";

function MovieGrid({ movies }) {
  if (!movies || movies.length === 0) {
    return (
      <div className="text-center text-gray-400 py-20">No movies found.</div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie.movieId} movie={movie} />
      ))}
    </div>
  );
}

export default MovieGrid;
