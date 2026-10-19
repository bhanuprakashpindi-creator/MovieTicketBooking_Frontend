import { useEffect, useState, useRef } from "react";
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
import useDebounce from "../../hooks/useDebounce";

function Movies() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const isInitialMount = useRef(true);

  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("");
  const [certificate, setCertificate] = useState("");
  const [rating, setRating] = useState("");
  const [sort, setSort] = useState("");

  // =====================================================
  // FETCH ALL MOVIES
  // =====================================================
  const fetchMovies = async (pageNumber = page) => {
    setLoading(true);
    setError("");

    try {
      const response = await getAllMovies(pageNumber, 12);
      const data = response.data;
      if (Array.isArray(data)) {
        setMovies(data);
        setTotalPages(1);
      } else {
        setMovies(data?.content || []);
        setTotalPages(data?.totalPages || 0);
      }
    } catch (err) {
      console.error("Failed to load movies:", err);
      setError("Failed to load movies. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD MOVIES WHEN PAGE CHANGES
  // =====================================================
  useEffect(() => {
    // Only fetch if not currently on a custom search or filter result
    if (!search && !genre && !language && !certificate && !rating && !sort) {
      fetchMovies(page);
    }
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
        setPage(0);
        await fetchMovies(0);
        return;
      }

      setMovies(Array.isArray(response.data) ? response.data : response.data?.content || []);
      setTotalPages(0);
    } catch (err) {
      console.error("Sorting Failed:", err);
      setError("Failed to sort movies.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DEBOUNCED SEARCH EFFECT
  // =====================================================
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const executeDebouncedSearch = async () => {
      const query = debouncedSearch.trim();

      if (!query) {
        setPage(0);
        fetchMovies(0);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await searchMovies(query);
        setMovies(Array.isArray(response.data) ? response.data : response.data?.content || []);
        setTotalPages(0);
      } catch (err) {
        console.error("Debounced Search Failed:", err);
        setError("Failed to search movies.");
      } finally {
        setLoading(false);
      }
    };

    executeDebouncedSearch();
  }, [debouncedSearch]);

  // =====================================================
  // SEARCH (INSTANT ON SUBMIT)
  // =====================================================
  const handleSearch = async (event) => {
    if (event) event.preventDefault();
    const query = search.trim();

    if (!query) {
      setPage(0);
      fetchMovies(0);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await searchMovies(query);
      setMovies(Array.isArray(response.data) ? response.data : response.data?.content || []);
      setTotalPages(0);
    } catch (err) {
      console.error("Search Failed:", err);
      setError("Failed to search movies.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(0);
    fetchMovies(0);
  };

  // =====================================================
  // FILTER
  // =====================================================
  const handleFilter = async () => {
    setLoading(true);
    setError("");

    try {
      let response;
      if (genre) {
        response = await getMoviesByGenre(genre);
      } else if (language) {
        response = await getMoviesByLanguage(language);
      } else if (certificate) {
        response = await getMoviesByCertificate(certificate);
      } else if (rating) {
        response = await getMoviesByMinimumRating(rating);
      } else {
        setPage(0);
        await fetchMovies(0);
        return;
      }

      setMovies(Array.isArray(response.data) ? response.data : response.data?.content || []);
      setTotalPages(0);
    } catch (err) {
      console.error("Filtering Failed:", err);
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
    setSort("");
    setSearch("");
    setPage(0);
    fetchMovies(0);
  };

  const hasActiveFilters = Boolean(genre || language || certificate || rating || sort || search);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary px-4 sm:px-6 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* =================================================
            HEADER
        ================================================= */}
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-primary" />
            <p className="text-xs uppercase tracking-widest text-accent-primary font-bold">
              Explore Cinema
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mt-1 text-text-primary">
            All Movies
          </h1>
          <p className="text-text-secondary text-sm sm:text-base mt-2">
            Discover trending releases, filter by your favorite genres, and reserve your seats.
          </p>
        </div>

        {/* =================================================
            SEARCH BAR
        ================================================= */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-base">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search by title, director, cast..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-24 py-3.5 rounded-xl bg-bg-surface border border-border text-text-primary placeholder:text-text-muted outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary text-sm transition"
            />
            {search.trim() && search !== debouncedSearch && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-accent-gold font-medium animate-pulse">
                Searching...
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 sm:flex-initial px-6 py-3.5 bg-accent-primary hover:bg-accent-hover text-white rounded-xl font-semibold text-sm transition shadow-button active:scale-95"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-4 py-3.5 bg-bg-surface hover:bg-bg-elevated border border-border text-text-secondary rounded-xl text-sm transition"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* =================================================
            FILTERS & SORT BAR
        ================================================= */}
        <div className="bg-bg-surface border border-border p-4 sm:p-5 rounded-2xl shadow-card space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* GENRE */}
            <select
              value={genre}
              onChange={(e) => {
                setGenre(e.target.value);
                setLanguage("");
                setCertificate("");
                setRating("");
              }}
              className="px-3.5 py-2.5 bg-bg-elevated border border-border rounded-xl text-xs sm:text-sm text-text-primary outline-none focus:border-accent-primary"
            >
              <option value="">All Genres</option>
              <option value="ACTION">Action</option>
              <option value="ADVENTURE">Adventure</option>
              <option value="ANIMATION">Animation</option>
              <option value="COMEDY">Comedy</option>
              <option value="CRIME">Crime</option>
              <option value="DRAMA">Drama</option>
              <option value="HORROR">Horror</option>
              <option value="ROMANCE">Romance</option>
              <option value="SCI_FI">Sci-Fi</option>
              <option value="THRILLER">Thriller</option>
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
              className="px-3.5 py-2.5 bg-bg-elevated border border-border rounded-xl text-xs sm:text-sm text-text-primary outline-none focus:border-accent-primary"
            >
              <option value="">All Languages</option>
              <option value="ENGLISH">English</option>
              <option value="TELUGU">Telugu</option>
              <option value="HINDI">Hindi</option>
              <option value="TAMIL">Tamil</option>
              <option value="KANNADA">Kannada</option>
              <option value="MALAYALAM">Malayalam</option>
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
              className="px-3.5 py-2.5 bg-bg-elevated border border-border rounded-xl text-xs sm:text-sm text-text-primary outline-none focus:border-accent-primary"
            >
              <option value="">All Certificates</option>
              <option value="U">U (Universal)</option>
              <option value="UA">UA (Parental Guidance)</option>
              <option value="A">A (Adults Only)</option>
              <option value="S">S (Specialized)</option>
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
              className="px-3.5 py-2.5 bg-bg-elevated border border-border rounded-xl text-xs sm:text-sm text-text-primary outline-none focus:border-accent-primary"
            >
              <option value="">Minimum Rating</option>
              <option value="5">⭐ 5.0+</option>
              <option value="6">⭐ 6.0+</option>
              <option value="7">⭐ 7.0+</option>
              <option value="8">⭐ 8.0+</option>
              <option value="9">⭐ 9.0+</option>
            </select>

            {/* SORT */}
            <select
              value={sort}
              onChange={(e) => handleSort(e.target.value)}
              className="px-3.5 py-2.5 bg-bg-elevated border border-border rounded-xl text-xs sm:text-sm text-accent-gold font-medium outline-none focus:border-accent-gold"
            >
              <option value="">Sort By</option>
              <option value="rating">⭐ Highest Rating</option>
              <option value="releaseDate">📅 Latest Release</option>
            </select>

            {/* ACTIONS */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleFilter}
                className="px-4 py-2.5 bg-accent-primary hover:bg-accent-hover text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-button"
              >
                Apply
              </button>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-3.5 py-2.5 bg-bg-elevated hover:bg-bg-surface border border-border text-text-secondary rounded-xl text-xs sm:text-sm transition"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50 text-xs">
              <span className="text-text-muted font-medium">Active filters:</span>
              {search && (
                <span className="bg-bg-elevated border border-border px-2.5 py-1 rounded-md text-text-secondary flex items-center gap-1.5">
                  Search: "{search}"
                </span>
              )}
              {genre && (
                <span className="bg-bg-elevated border border-border px-2.5 py-1 rounded-md text-text-secondary">
                  Genre: {genre}
                </span>
              )}
              {language && (
                <span className="bg-bg-elevated border border-border px-2.5 py-1 rounded-md text-text-secondary">
                  Language: {language}
                </span>
              )}
              {certificate && (
                <span className="bg-bg-elevated border border-border px-2.5 py-1 rounded-md text-text-secondary">
                  Cert: {certificate}
                </span>
              )}
              {rating && (
                <span className="bg-bg-elevated border border-border px-2.5 py-1 rounded-md text-text-secondary">
                  Rating: {rating}+
                </span>
              )}
              {sort && (
                <span className="bg-bg-elevated border border-border px-2.5 py-1 rounded-md text-accent-gold">
                  Sorted by: {sort}
                </span>
              )}
            </div>
          )}
        </div>

        {/* =================================================
            ERROR BANNER
        ================================================= */}
        {error && (
          <div className="p-4 rounded-xl bg-accent-primary/10 border border-accent-primary/30 text-accent-primary text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => fetchMovies(page)}
              className="text-xs font-bold underline hover:no-underline ml-4"
            >
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            MOVIES GRID / LOADING
        ================================================= */}
        <MovieGrid movies={movies} loading={loading} />

        {/* =================================================
            PAGINATION
        ================================================= */}
        {!search && !genre && !language && !certificate && !rating && !sort && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-8">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="px-5 py-2.5 bg-bg-surface border border-border rounded-xl text-sm font-semibold text-text-primary disabled:opacity-40 hover:bg-bg-elevated transition shadow-sm"
            >
              ← Previous
            </button>

            <span className="text-text-secondary text-sm font-medium px-2">
              Page <span className="text-text-primary font-bold">{page + 1}</span> of{" "}
              <span className="text-text-primary font-bold">{totalPages}</span>
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1 || loading}
              className="px-5 py-2.5 bg-accent-primary hover:bg-accent-hover text-white rounded-xl text-sm font-semibold disabled:opacity-40 transition shadow-button"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Movies;
