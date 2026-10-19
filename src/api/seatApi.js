import api from "./axios";

// Get seats for a show (per-show availability)
export const getSeatsByShow = (showId) => {
  return api.get(`/api/shows/${showId}/seats`);
};

// Get physical seats for a screen
export const getSeatsByScreen = (screenId) => {
  return api.get(`/api/seats/screen/${screenId}`).catch(() => {
    // Graceful fallback if controller is mapped under /api/screens/{screenId}/seats
    return api.get(`/api/screens/${screenId}/seats`);
  });
};

// Create a single seat
export const createSeat = (seatData) => {
  return api.post("/api/seats", seatData);
};

// Update seat
export const updateSeat = (seatId, seatData) => {
  return api.put(`/api/seats/${seatId}`, seatData);
};

// Delete seat
export const deleteSeat = (seatId) => {
  return api.delete(`/api/seats/${seatId}`);
};

