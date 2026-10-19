import api from "./axios";

// Get all screens
export const getAllScreens = () => {
  return api.get("/api/screens");
};

// Get screen by ID
export const getScreenById = (screenId) => {
  return api.get(`/api/screens/${screenId}`);
};

// Get screens by theater
export const getScreensByTheater = (theaterId) => {
  return api.get(`/api/screens/theater/${theaterId}`);
};

// Create screen (can accept theaterId in body or path)
export const createScreen = (screenData) => {
  return api.post("/api/screens", screenData);
};

// Update screen
export const updateScreen = (screenId, screenData) => {
  return api.put(`/api/screens/${screenId}`, screenData);
};

// Delete screen
export const deleteScreen = (screenId) => {
  return api.delete(`/api/screens/${screenId}`);
};
