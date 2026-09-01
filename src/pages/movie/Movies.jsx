import { useEffect, useState } from "react";

import {
  getAllMovies,
  searchMovies,
  getMoviesByGenre,
  getMoviesByLanguage,
  getMoviesByCertificate,
  getMoviesByMinimumRating,
  getMoviesSortedByRating,
  getMoviesSortedByReleaseDate,
} from "../../api/movieApi";

import MovieGrid from "../../components/movie/MovieGrid";

function Movies() {
  const [movies, setMovies] = useState([]);

  const [page, setPage] = useState(0);

  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [genre, setGenre] = useState("");

  const [language, setLanguage] = useState("");

  const [certificate, setCertificate] = useState("");

  const [rating, setRating] = useState("");

  const [sort, setSort] = useState("");
  // =====================================================
  // FETCH ALL MOVIES
  // =====================================================

  const fetchMovies = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAllMovies(page, 10);

      console.log("MOVIE RESPONSE:", response.data);

      setMovies(response.data.content);

      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Failed to load movies:", error);

      setError("Failed to load movies.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD MOVIES WHEN PAGE CHANGES
  // =====================================================

  useEffect(() => {
    fetchMovies();
  }, [page]);

  // ====================================================
  // SORTING
  //=====================================================

  const handleSort = async (value) => {
    setSort(value);

    setLoading(true);
    setError("");

    try {
      let response;

      if (value === "rating") {
        response = await getMoviesSortedByRating();
      } else if (value === "releaseDate") {
        response = await getMoviesSortedByReleaseDate();
      } else {
        await fetchMovies();

        return;
      }

      console.log("SORT RESULT:", response.data);

      setMovies(response.data);

      setTotalPages(0);
    } catch (error) {
      console.error("Sorting Failed:", error);

      setError("Failed to sort movies.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = async (event) => {
    event.preventDefault();

    if (!search.trim()) {
      setPage(0);

      fetchMovies();

      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await searchMovies(search.trim());

      console.log("SEARCH RESULT:", response.data);

      setMovies(response.data);

      setTotalPages(0);
    } catch (error) {
      console.error("Search Failed:", error);

      setError("Failed to search movies.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CLEAR SEARCH
  // =====================================================

  const handleClearSearch = () => {
    setSearch("");

    setPage(0);

    fetchMovies();
  };

  // =====================================================
  // FILTER
  // =====================================================

  const handleFilter = async () => {
    setLoading(true);
    setError("");

    try {
      let response;

      // -------------------------------
      // GENRE
      // -------------------------------

      if (genre) {
        response = await getMoviesByGenre(genre);
      }

      // -------------------------------
      // LANGUAGE
      // -------------------------------
      else if (language) {
        response = await getMoviesByLanguage(language);
      }

      // -------------------------------
      // CERTIFICATE
      // -------------------------------
      else if (certificate) {
        response = await getMoviesByCertificate(certificate);
      }

      // -------------------------------
      // RATING
      // -------------------------------
      else if (rating) {
        response = await getMoviesByMinimumRating(rating);
      }

      // -------------------------------
      // NO FILTER
      // -------------------------------
      else {
        setPage(0);

        await fetchMovies();

        return;
      }

      console.log("FILTER RESULT:", response.data);

      setMovies(response.data);

      setTotalPages(0);
    } catch (error) {
      console.error("Filtering Failed:", error);

      setError("Failed to filter movies.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const handleClearFilters = () => {
    setGenre("");

    setLanguage("");

    setCertificate("");

    setRating("");

    setSearch("");

    setPage(0);

    fetchMovies();
  };

  // =====================================================
  // PAGINATION
  // =====================================================

  const handlePrevious = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-xl">Loading movies...</p>
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
      <div className="max-w-7xl mx-auto">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-10">
          <p className="text-red-500 font-semibold uppercase tracking-wider">
            Now Showing
          </p>

          <h1 className="text-4xl font-bold mt-2">Movies</h1>
        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <form onSubmit={handleSearch} className="flex gap-3 mb-10 max-w-2xl">
          <input
            type="text"
            placeholder="Search For Movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 outline-none focus:border-red-500"
          />

          <button
            type="submit"
            className="px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition">
            Search
          </button>

          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-6 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition">
              Clear
            </button>
          )}
        </form>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="flex flex-wrap gap-4 mb-10">
          {/* GENRE */}

          <select
            value={genre}
            onChange={(e) => {
              setGenre(e.target.value);

              setLanguage("");

              setCertificate("");

              setRating("");
            }}
            className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg">
            <option value="">Genre</option>

            <option value="Action">Action</option>

            <option value="Comedy">Comedy</option>

            <option value="Drama">Drama</option>

            <option value="Thriller">Thriller</option>

            <option value="Romance">Romance</option>
          </select>

          {/* LANGUAGE */}

          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);

              setGenre("");

              setCertificate("");

              setRating("");
            }}
            className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg">
            <option value="">Language</option>

            <option value="English">English</option>

            <option value="Telugu">Telugu</option>

            <option value="Hindi">Hindi</option>

            <option value="Tamil">Tamil</option>
          </select>

          {/* CERTIFICATE */}

          <select
            value={certificate}
            onChange={(e) => {
              setCertificate(e.target.value);

              setGenre("");

              setLanguage("");

              setRating("");
            }}
            className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg">
            <option value="">Certificate</option>

            <option value="U">U</option>

            <option value="UA">UA</option>

            <option value="A">A</option>
          </select>

          {/* RATING */}

          <select
            value={rating}
            onChange={(e) => {
              setRating(e.target.value);

              setGenre("");

              setLanguage("");

              setCertificate("");
            }}
            className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg">
            <option value="">Minimum Rating</option>

            <option value="5">5+</option>

            <option value="6">6+</option>

            <option value="7">7+</option>

            <option value="8">8+</option>

            <option value="9">9+</option>
          </select>

          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value)}
            className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg">
            <option value="">Sort By</option>

            <option value="rating">⭐ Highest Rating</option>

            <option value="releaseDate">📅 Latest Release</option>
          </select>

          {/* APPLY FILTER */}

          <button
            onClick={handleFilter}
            className="px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition">
            Apply Filter
          </button>

          {/* CLEAR FILTERS */}

          <button
            onClick={handleClearFilters}
            className="px-6 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition">
            Clear Filters
          </button>
        </div>

        {/* =================================================
            MOVIES
        ================================================= */}

        {movies.length > 0 ? (
          <MovieGrid movies={movies} />
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No movies found.</p>
          </div>
        )}

        {/* =================================================
            PAGINATION
        ================================================= */}

        {!search && totalPages > 1 && (
          <div className="flex justify-center items-center gap-6 mt-12">
            <button
              onClick={handlePrevious}
              disabled={page === 0}
              className="px-5 py-2 bg-slate-700 rounded-lg disabled:opacity-40 hover:bg-slate-600 transition">
              ← Previous
            </button>

            <span className="text-gray-300">
              Page {page + 1} of {totalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={page === totalPages - 1}
              className="px-5 py-2 bg-red-600 rounded-lg disabled:opacity-40 hover:bg-red-700 transition">
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Movies;
