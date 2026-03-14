import axios, { AxiosResponse, AxiosError } from "axios";

const api = axios.create({
  baseURL: "/",
  withCredentials: true,
});

api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.status === 401 || response.status === 403) {
      localStorage.clear();
      window.location.href = "/sign-in";
      return response;
    }
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      localStorage.clear();
      window.location.href = "/sign-in";
    }
    return Promise.reject(error);
  }
);

export default api;
