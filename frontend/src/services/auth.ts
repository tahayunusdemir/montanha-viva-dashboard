import api from "../lib/axios";
import type { User, Tokens, AuthResponse } from "../types";
import type {
  RegisterData,
  LoginCredentials,
  ChangePasswordData,
  PasswordResetRequestPayload,
  PasswordResetConfirmPayload,
} from "../types/auth";
import { useAuthStore } from "../store/authStore";

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

export const logout = async (): Promise<void> => {
  await api.post("/users/logout/", {});
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<User>("/users/me/");
  return response.data;
};

export const refreshToken = async (): Promise<{ access: string }> => {
  const refresh = useAuthStore.getState().refreshToken;
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

export const requestPasswordReset = async (
  payload: PasswordResetRequestPayload,
): Promise<{ detail: string }> => {
  const response = await api.post("/users/password-reset/", payload);
  return response.data;
};

export const confirmPasswordReset = async (
  payload: PasswordResetConfirmPayload,
): Promise<{ detail: string }> => {
  const response = await api.post("/users/password-reset/confirm/", payload);
  return response.data;
};

export const deleteAccount = async (): Promise<void> => {
  await api.delete("/users/me/");
};
