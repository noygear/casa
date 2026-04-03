import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.startsWith('/auth/');
      if (!isAuthEndpoint) {
        window.location.href = '/login';
      }
    }

    // Extract detailed error message from backend response
    const data = error.response?.data;
    if (data) {
      let detail = data.message || error.message;
      if (data.issues?.length) {
        const fields = data.issues.map((i: { path: string; message: string }) => `${i.path}: ${i.message}`).join(', ');
        detail = `${detail} (${fields})`;
      }
      error.message = detail;
    }

    return Promise.reject(error);
  }
);

export default apiClient;
