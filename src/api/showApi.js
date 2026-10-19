import api from "./axios";

// Get all shows
export const getAllShows = () => {
  return api.get("/api/shows");
};

// Get show by ID
export const getShowById = (showId) => {
  return api.get(`/api/shows/${showId}`);
};

// Get seats for a show
export const getShowSeats = (showId) => {
  return api.get(`/api/shows/${showId}/seats`);
};

// Get shows by movie
export const getShowsByMovie = (movieId) => {
  return api.get(`/api/shows/movie/${movieId}`);
};

// Get shows by date
export const getShowsByDate = (date) => {
  return api.get(`/api/shows/date/${date}`);
};

// Get shows by movie and date
export const getShowsByMovieAndDate = (movieId, date) => {
  return api.get(`/api/shows/movie/${movieId}/date/${date}`);
};

// Get shows by theater
export const getShowsByTheater = (theaterId) => {
  return api.get(`/api/shows/theater/${theaterId}`);
};

// Get shows by theater and date
export const getShowsByTheaterAndDate = (theaterId, date) => {
  return api.get(`/api/shows/theater/${theaterId}/date/${date}`);
};

// Get shows by movie, theater and date
export const getShowsByMovieAndTheaterAndDate = (movieId, theaterId, date) => {
  return api.get(
    `/api/shows/movie/${movieId}/theater/${theaterId}/date/${date}`,
  );
};

// Create show
export const createShow = (showData) => {
  return api.post("/api/shows", showData);
};

// Update show
export const updateShow = (showId, showData) => {
  return api.put(`/api/shows/${showId}`, showData);
};

// Delete show
export const deleteShow = (showId) => {
  return api.delete(`/api/shows/${showId}`);
};

