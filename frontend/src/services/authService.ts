import { axiosInstance } from "@/lib/axios";
import { AxiosError } from "axios";
import { setCookie, deleteCookie } from "cookies-next";

export const AuthService = {
  async login(credentials: { username: string; password: string }) {
    try {
      const response = await axiosInstance.post("/login", credentials);
      const { data } = response;

      if (data.status && data.token) {
        setCookie("auth_token", data.token, {
          maxAge: 60 * 60 * 12,
          path: "/",
        });
        setCookie("name", data.user.name);
        setCookie("role", data.user.role);
        return data;
      }

      throw new Error(data.message || "Login Failed");
    } catch (error) {
      return this.handleError(error);
    }
  },

  async logout() {
    try {
      await axiosInstance.post("/logout");
    } catch (error) {
      return this.handleError(error);
    } finally {
      deleteCookie("auth_token");
      deleteCookie("name");
      deleteCookie("role");
      window.location.href = "/login";
    }
  },

  handleError(error: unknown): never {
    let message = "Server Error";

    if (error instanceof AxiosError) {
      message = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }

    console.error("API Service Error:", message);
    throw new Error(message);
  },
};
