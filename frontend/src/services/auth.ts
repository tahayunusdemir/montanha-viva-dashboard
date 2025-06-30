import api from "../lib/axios";
import type { User, Tokens, AuthResponse } from "../types";
import type {
  RegisterData,
  LoginCredentials,
  ChangePasswordData,
} from "../types/auth";

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/users/register/", data);
  return response.data;
};

export const login = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/users/token/", credentials);
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<User>("/users/me/");
  return response.data;
};

export const refreshToken = async (
  refresh: string,
): Promise<{ access: string }> => {
  const response = await api.post<{ access: string }>("/users/token/refresh/", {
    refresh,
  });
  return response.data;
};

export const updateMe = async (data: Partial<RegisterData>): Promise<User> => {
  const response = await api.patch<User>("/users/me/", data);
  return response.data;
};

export const changePassword = async (
  data: ChangePasswordData,
): Promise<void> => {
  await api.put("/users/me/change-password/", data);
};

export const deleteAccount = async (): Promise<void> => {
  await api.delete("/users/me/");
};
