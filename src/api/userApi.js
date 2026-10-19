import api from "./axios";

export const getProfile = () => {
  return api.get(`/api/users/profile`);
};
