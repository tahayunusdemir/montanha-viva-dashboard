import api from "../lib/axios";
import type { AuthResponse, Tokens } from "../types";
import type { LoginCredentials, RegisterData } from "../types/auth.ts";

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post("/register/", data);
  return response.data;
};

export const login = async (credentials: LoginCredentials): Promise<Tokens> => {
  const response = await api.post("/token/", credentials);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/users/me/");
  return response.data;
};

export const refreshToken = async (refresh: string): Promise<Tokens> => {
  const response = await api.post("/token/refresh/", { refresh });
  return response.data;
};
