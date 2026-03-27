import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// IDトークン自動付与（Firebase Auth 実装後に有効化）
// apiClient.interceptors.request.use(async (config) => {
//   const token = await getIdToken();
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

export default apiClient;
