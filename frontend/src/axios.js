import axios from 'axios';

const API_BASE_URL = 'http://35.200.189.243:8080'; 

const api = axios.create({
  baseURL: API_BASE_URL
});

export default api;
