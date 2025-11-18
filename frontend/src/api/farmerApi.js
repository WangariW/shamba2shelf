import api from "./axios";

export const updateFarmerLocation = async (farmerId, data) => {
  return api.put(`/farmer/${farmerId}/location`, data);
};
