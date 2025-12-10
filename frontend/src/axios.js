import axios from 'axios';

const API_BASE_URL = `http://34.152.117.79:8080`;

const api = axios.create({
  baseURL: API_BASE_URL
});

export default api;

