import axios from 'axios';

// Default to Android Emulator localhost IP.
// Change to your machine's LAN IP if testing on a physical device.
const API_URL = 'http://10.0.2.2:5000/api';
export const SOCKET_URL = 'http://10.0.2.2:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
