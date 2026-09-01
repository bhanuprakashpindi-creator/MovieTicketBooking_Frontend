import api from "./axios";

export const registerUser = (userData) => {
  return api.post("/api/auth/register", userData);
};

export const loginUser = (loginData) => {
  return api.post("/api/auth/login", loginData);
};

export const getProfile = () => {
  return api.get("/api/users/profile");
};

export const updateProfile = (userData) => {
  return api.put("/api/users/profile", userData);
};

export const changePassword = (passwordData) => {
  return api.put("/api/users/change-password", passwordData);
};
