import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export const fetchInterfaces = () => api.get('interfaces/');
export const startCapture = (data) => api.post('capture/', data);
export const stopCapture = (sessionId) => api.post(`capture/${sessionId}/stop/`);