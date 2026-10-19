import api from "./axios";

export const getAllTheaters = () => {
  return api.get("/api/theaters");
};

export const getTheaterById = (theaterId) => {
  return api.get(`/api/theaters/${theaterId}`);
};

export const createTheater = (theaterData) => {
  return api.post("/api/theaters", theaterData);
};

export const updateTheater = (theaterId, theaterData) => {
  return api.put(`/api/theaters/${theaterId}`, theaterData);
};

export const deleteTheater = (theaterId) => {
  return api.delete(`/api/theaters/${theaterId}`);
};
