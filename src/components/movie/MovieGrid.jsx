import MovieCard from "./MovieCard";

function MovieGrid({ movies, loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <div
            key={n}
            className="bg-bg-surface border border-border rounded-2xl overflow-hidden animate-pulse flex flex-col"
          >
            <div className="aspect-[2/3] bg-bg-elevated w-full" />
            <div className="p-5 space-y-3">
              <div className="h-5 bg-bg-elevated rounded-md w-3/4" />
              <div className="flex gap-2">
                <div className="h-4 bg-bg-elevated rounded w-16" />
                <div className="h-4 bg-bg-elevated rounded w-16" />
              </div>
              <div className="h-10 bg-bg-elevated rounded-xl mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="text-center py-20 px-4 bg-bg-surface/50 border border-border rounded-2xl max-w-lg mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-bg-elevated flex items-center justify-center text-3xl">
          🎬
        </div>
        <h3 className="text-lg font-bold text-text-primary mb-1">No Movies Found</h3>
        <p className="text-sm text-text-muted">
          We couldn't find any movies matching your current search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie.movieId} movie={movie} />
      ))}
    </div>
  );
}

export default MovieGrid;
