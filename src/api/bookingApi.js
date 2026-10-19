import api from "./axios";

// Create booking
export const createBooking = (bookingRequest) => {
  return api.post("/api/bookings", bookingRequest);
};

// Get my bookings
export const getMyBookings = () => {
  return api.get("/api/bookings/my");
};

// Get booking by ID
export const getBookingById = (bookingId) => {
  return api.get(`/api/bookings/${bookingId}`);
};

// Get all bookings (Admin)
export const getAllBookings = () => {
  return api.get("/api/bookings");
};

// Cancel booking
export const cancelBooking = (bookingId) => {
  return api.delete(`/api/bookings/${bookingId}`);
};

