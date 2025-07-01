import api from "@/lib/axios";
import { AdminUser, UserUpdatePayload, CreateUserPayload } from "@/types/user";

export const getUsers = async (): Promise<AdminUser[]> => {
  const response = await api.get("/users/admin/users/");
  return response.data;
};

export const createUser = async (
  userData: CreateUserPayload,
): Promise<AdminUser> => {
  const response = await api.post("/users/admin/users/", userData);
  return response.data;
};

export const updateUser = async ({
  id,
  payload,
}: {
  id: number;
  payload: UserUpdatePayload;
}): Promise<AdminUser> => {
  const response = await api.patch(`/users/admin/users/${id}/`, payload);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/admin/users/${id}/`);
};
