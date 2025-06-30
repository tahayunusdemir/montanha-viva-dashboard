import api from "../lib/axios";
import type { AuthResponse, Tokens, User } from "../types";
import type {
  LoginCredentials,
  RegisterData,
  ChangePasswordData,
} from "../types/auth.ts";

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post("/register/", data);
  return response.data;
};

export const login = async (credentials: LoginCredentials): Promise<Tokens> => {
  const response = await api.post("/token/", {
    username: credentials.email,
    password: credentials.password,
  });
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await api.get("/users/me/");
  return response.data;
};

export const refreshToken = async (refresh: string): Promise<Tokens> => {
  const response = await api.post("/token/refresh/", { refresh });
  return response.data;
};

export const updateMe = async (data: {
  first_name: string;
  last_name: string;
}): Promise<User> => {
  const response = await api.patch<User>("/users/me/", data);
  return response.data;
};

export const changePassword = async (data: ChangePasswordData) => {
  const response = await api.post("/users/set_password/", data);
  return response.data;
};

export const deleteAccount = async () => {
  const response = await api.delete("/users/me/");
  return response.data;
};
