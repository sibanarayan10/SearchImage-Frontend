import axios, { AxiosResponse, AxiosError } from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: "/",
  withCredentials: true,
});

api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("user");
      toast.warn("Please sign in to continue", { toastId: "auth-required" });
      return response;
    }
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("user");
      toast.warn("Please sign in to continue", { toastId: "auth-required" });
    }
    return Promise.reject(error);
  }
);

export default api;
