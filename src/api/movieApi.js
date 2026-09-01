import api from "./axios";

// Get paginated movies
export const getAllMovies = (page = 0, size = 10) => {
  return api.get("/api/movies", {
    params: {
      page,
      size,
    },
  });
};

// Get movie by ID
export const getMovieById = (movieId) => {
  return api.get(`/api/movies/${movieId}`);
};

// Search movies
export const searchMovies = (title) => {
  return api.get("/api/movies/search", {
    params: {
      title,
    },
  });
};

// Filter by genre
export const getMoviesByGenre = (genre) => {
  return api.get(`/api/movies/genre/${genre}`);
};

// Filter by language
export const getMoviesByLanguage = (language) => {
  return api.get(`/api/movies/language/${language}`);
};

// Filter by certificate
export const getMoviesByCertificate = (certificate) => {
  return api.get(`/api/movies/certificate/${certificate}`);
};

// Filter by minimum rating
export const getMoviesByMinimumRating = (rating) => {
  return api.get("/api/movies/rating", {
    params: {
      rating,
    },
  });
};

// Sort by rating
export const getMoviesSortedByRating = () => {
  return api.get("/api/movies/sort/rating");
};

// Sort by release date
export const getMoviesSortedByReleaseDate = () => {
  return api.get("/api/movies/sort/release-date");
};
