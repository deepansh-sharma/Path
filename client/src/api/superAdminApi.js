import axios from 'axios';

const API_URL = 'http://localhost:5000/api/super-admin';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getSuperAdminMetrics = async () => {
  const response = await axios.get(`${API_URL}/metrics/overview`, getAuthHeaders());
  return response.data;
};

export const getSuperAdminLabs = async () => {
  const response = await axios.get(`${API_URL}/labs`, getAuthHeaders());
  return response.data;
};