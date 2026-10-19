import { useEffect, useState } from "react";
import {
  getAllMovies,
  createMovie,
  updateMovie,
  deleteMovie,
} from "../../api/movieApi";
import useDebounce from "../../hooks/useDebounce";

const GENRES = [
  "ACTION",
  "ADVENTURE",
  "ANIMATION",
  "BIOGRAPHY",
  "COMEDY",
  "CRIME",
  "DOCUMENTARY",
  "DRAMA",
  "FAMILY",
  "FANTASY",
  "HISTORY",
  "HORROR",
  "MUSICAL",
  "MYSTERY",
  "ROMANCE",
  "SCI_FI",
  "SPORT",
  "SUPERHERO",
  "THRILLER",
  "WAR",
  "WESTERN",
];

const LANGUAGES = [
  "ARABIC",
  "ASSAMESE",
  "BENGALI",
  "BHOJPURI",
  "CHINESE",
  "ENGLISH",
  "FRENCH",
  "GERMAN",
  "GUJARATI",
  "HINDI",
  "ITALIAN",
  "JAPANESE",
  "KANNADA",
  "KASHMIRI",
  "KONKANI",
  "KOREAN",
  "MALAYALAM",
  "MARATHI",
  "ODIA",
  "PORTUGUESE",
  "PUNJABI",
  "RUSSIAN",
  "SANSKRIT",
  "SPANISH",
  "TAMIL",
  "TELUGU",
  "TULU",
  "URDU",
];

const CERTIFICATES = ["U", "UA", "A", "S"];

const INITIAL_FORM = {
  movieTitle: "",
  genre: "",
  language: "",
  durationInMinutes: "",
  releaseDate: "",
  rating: "",
  posterUrl: "",
  description: "",
  certificate: "",
  director: "",
  cast: "",
  trailerUrl: "",
};

function AdminMovies() {
  const [movies, setMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState(INITIAL_FORM);

  const [isEditing, setIsEditing] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState(null);

  const [alert, setAlert] = useState({
    type: "",
    message: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchMovies = async () => {
    try {
      setLoadingMovies(true);

      const response = await getAllMovies(0, 100);

      setMovies(response.data?.content || []);
    } catch (err) {
      console.error("Failed to fetch movies:", err);

      setAlert({
        type: "error",
        message: "Failed to load movies from the server.",
      });
    } finally {
      setLoadingMovies(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditClick = (movie) => {
    setIsEditing(true);
    setEditingMovieId(movie.movieId);

    setFormData({
      movieTitle: movie.movieTitle || "",
      genre: movie.genre || "",
      language: movie.language || "",
      durationInMinutes: movie.durationInMinutes || "",
      releaseDate: movie.releaseDate || "",
      rating: movie.rating ?? "",
      posterUrl: movie.posterUrl || "",
      description: movie.description || "",
      certificate: movie.certificate || "",
      director: movie.director || "",
      cast: movie.cast || "",
      trailerUrl: movie.trailerUrl || "",
    });

    setAlert({
      type: "",
      message: "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingMovieId(null);
    setFormData(INITIAL_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    setAlert({
      type: "",
      message: "",
    });

    const payload = {
      ...formData,
      durationInMinutes: Number(formData.durationInMinutes),
      rating: Number(formData.rating),
    };

    try {
      if (isEditing) {
        await updateMovie(editingMovieId, payload);

        setAlert({
          type: "success",
          message: `Movie "${formData.movieTitle}" updated successfully!`,
        });

        handleCancelEdit();
      } else {
        await createMovie(payload);

        setAlert({
          type: "success",
          message: `Movie "${formData.movieTitle}" added successfully!`,
        });

        setFormData(INITIAL_FORM);
      }

      await fetchMovies();
    } catch (err) {
      console.error("Failed to save movie:", err);

      setAlert({
        type: "error",
        message:
          err.response?.data?.message ||
          (isEditing
            ? "Failed to update movie."
            : "Failed to add movie."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMovie = async (movie) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${movie.movieTitle}"? This will delete the movie and may affect related shows.`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(movie.movieId);

      setAlert({
        type: "",
        message: "",
      });

      await deleteMovie(movie.movieId);

      setAlert({
        type: "success",
        message: `Movie "${movie.movieTitle}" deleted successfully.`,
      });

      if (isEditing && editingMovieId === movie.movieId) {
        handleCancelEdit();
      }

      await fetchMovies();
    } catch (err) {
      console.error("Failed to delete movie:", err);

      setAlert({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to delete movie. It may have associated shows or active bookings.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMovies = movies.filter((m) => {
    const query = debouncedSearchTerm.toLowerCase();

    return (
      m.movieTitle?.toLowerCase().includes(query) ||
      m.genre?.toLowerCase().includes(query) ||
      m.language?.toLowerCase().includes(query) ||
      m.director?.toLowerCase().includes(query)
    );
  });

  return (

    <div className="min-h-screen bg-slate-900 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold">
              Movie Management
            </h1>

            <p className="text-gray-400 mt-1">
              Add, update, and manage all movies in the system.
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-3">
            <span className="text-xs uppercase tracking-wider text-gray-400">
              Total Movies
            </span>

            <p className="text-2xl font-bold text-yellow-400">
              {movies.length}
            </p>
          </div>
        </div>

        {/* Global Notification Banner */}
        {alert.message && (
          <div
            className={`mb-8 p-4 rounded-xl border flex items-center justify-between gap-4 ${alert.type === "success"
              ? "bg-green-500/10 border-green-500 text-green-400"
              : "bg-red-500/10 border-red-500 text-red-400"
              }`}
          >
            <span>{alert.message}</span>

            <button
              onClick={() =>
                setAlert({
                  type: "",
                  message: "",
                })
              }
              className="text-sm font-bold opacity-75 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Movie Form */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 mb-12 shadow-xl">

          {/* Form Header */}
          <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isEditing
                  ? `Edit Movie: ${formData.movieTitle || ""}`
                  : "Add New Movie"}
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                {isEditing
                  ? "Update movie details below and click Update Movie."
                  : "Fill in all required fields to add a movie to the catalog."}
              </p>
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg text-sm transition"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {/* Movie Form */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >

            {/* Movie Title */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Movie Title{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="movieTitle"
                value={formData.movieTitle}
                onChange={handleChange}
                placeholder="e.g. Inception"
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              />
            </div>

            {/* Genre */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Genre{" "}
                <span className="text-red-500">*</span>
              </label>

              <select
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              >
                <option value="">Select Genre</option>

                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Language{" "}
                <span className="text-red-500">*</span>
              </label>

              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              >
                <option value="">Select Language</option>

                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Duration (minutes){" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="number"
                name="durationInMinutes"
                value={formData.durationInMinutes}
                onChange={handleChange}
                placeholder="e.g. 148"
                min="1"
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              />
            </div>

            {/* Release Date */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Release Date{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="date"
                name="releaseDate"
                value={formData.releaseDate}
                onChange={handleChange}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Rating (0.0 - 10.0){" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                placeholder="e.g. 8.8"
                min="0"
                max="10"
                step="0.1"
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              />
            </div>

            {/* Certificate */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Certificate{" "}
                <span className="text-red-500">*</span>
              </label>

              <select
                name="certificate"
                value={formData.certificate}
                onChange={handleChange}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              >
                <option value="">Select Certificate</option>

                {CERTIFICATES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Director */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Director{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="director"
                value={formData.director}
                onChange={handleChange}
                placeholder="e.g. Christopher Nolan"
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              />
            </div>

            {/* Cast */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Cast{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="cast"
                value={formData.cast}
                onChange={handleChange}
                placeholder="e.g. Leonardo DiCaprio, Joseph Gordon-Levitt"
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              />
            </div>

            {/* Poster URL */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Poster Image URL{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="url"
                name="posterUrl"
                value={formData.posterUrl}
                onChange={handleChange}
                placeholder="https://example.com/poster.jpg"
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              />
            </div>

            {/* Trailer URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Trailer URL{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="url"
                name="trailerUrl"
                value={formData.trailerUrl}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=..."
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Description / Synopsis{" "}
                <span className="text-red-500">*</span>
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief synopsis of the movie..."
                required
                rows="3"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400 transition"
              />
            </div>

            {/* Form Actions */}
            <div className="md:col-span-2 lg:col-span-3 flex items-center gap-4 pt-2">

              <button
                type="submit"
                disabled={submitting}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-3 rounded-lg disabled:opacity-50 transition shadow-lg"
              >
                {submitting
                  ? isEditing
                    ? "Updating Movie..."
                    : "Adding Movie..."
                  : isEditing
                    ? "Update Movie"
                    : "Add Movie"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Existing Movies Section */}
        <div>

          {/* Section Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

            <div>
              <h2 className="text-2xl font-bold">
                Existing Movies Catalog
              </h2>

              <p className="text-sm text-gray-400">
                Showing {filteredMovies.length} of {movies.length} movies
              </p>
            </div>

            {/* Search */}
            <div className="w-full sm:w-72 relative">

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search movies..."
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:border-yellow-400 transition pr-20"
              />

              {searchTerm.trim() &&
                searchTerm !== debouncedSearchTerm && (
                  <span className="absolute right-3 top-3 text-xs text-yellow-400 animate-pulse">
                    Filtering...
                  </span>
                )}
            </div>
          </div>

          {/* Loading */}
          {loadingMovies ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">
                Loading movies catalog...
              </p>
            </div>

          ) : filteredMovies.length === 0 ? (

            <div className="text-center py-16 bg-slate-800 border border-slate-700 rounded-2xl">

              <p className="text-gray-400 text-lg">
                {searchTerm
                  ? "No movies match your search query."
                  : "No movies found in the database. Add your first movie above!"}
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {filteredMovies.map((movie) => (

                <div
                  key={movie.movieId}
                  className={`bg-slate-800 border rounded-2xl overflow-hidden shadow-lg transition flex flex-col justify-between ${editingMovieId === movie.movieId
                    ? "border-yellow-400 ring-2 ring-yellow-400/30"
                    : "border-slate-700 hover:border-slate-600"
                    }`}
                >

                  <div>

                    {/* Poster */}
                    <div className="relative h-64 bg-slate-900">

                      {movie.posterUrl ? (
                        <img
                          src={movie.posterUrl}
                          alt={movie.movieTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          No Poster Available
                        </div>
                      )}

                      <span className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-sm text-yellow-400 font-bold px-3 py-1 rounded-full text-xs border border-yellow-400/40">
                        ⭐ {movie.rating}
                      </span>

                      <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm text-gray-200 font-semibold px-2.5 py-1 rounded-md text-xs border border-slate-700">
                        {movie.certificate}
                      </span>

                    </div>

                    {/* Movie Info */}
                    <div className="p-5">

                      <h3 className="text-xl font-bold truncate text-white">
                        {movie.movieTitle}
                      </h3>

                      <p className="text-xs font-semibold text-yellow-400 mt-1 uppercase tracking-wider">
                        {movie.language} •{" "}
                        {movie.genre?.replace("_", " ")}
                      </p>

                      <p className="text-xs text-gray-400 mt-2">
                        ⏱️ {movie.durationInMinutes} mins | 📅{" "}
                        {movie.releaseDate}
                      </p>

                      {movie.director && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          🎬{" "}
                          <span className="text-gray-300">
                            {movie.director}
                          </span>
                        </p>
                      )}

                      <p className="text-gray-400 text-sm mt-3 line-clamp-2">
                        {movie.description}
                      </p>

                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-5 pt-0 border-t border-slate-700/60 mt-4 flex gap-3">

                    <button
                      onClick={() => handleEditClick(movie)}
                      className="flex-1 bg-yellow-500/20 hover:bg-yellow-500 text-yellow-400 hover:text-black border border-yellow-500/40 py-2 rounded-lg font-semibold text-sm transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteMovie(movie)}
                      disabled={deletingId === movie.movieId}
                      className="flex-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-50"
                    >
                      {deletingId === movie.movieId
                        ? "Deleting..."
                        : "Delete"}
                    </button>

                  </div>
                </div>

              ))}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminMovies;