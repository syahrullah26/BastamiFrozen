import Axios from "axios";
import { getCookie, deleteCookie } from "cookies-next";

export const axiosInstance = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getCookie("auth_toke");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      deleteCookie("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
