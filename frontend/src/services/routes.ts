import axiosInstance from "@/lib/axios";
import { Route, PaginatedResponse } from "@/types/routes";

interface GetRoutesParams {
  page?: number;
  search?: string;
  difficulty?: string;
  route_type?: string;
  ordering?: string;
}

export const getRoutes = async (
  params: GetRoutesParams,
): Promise<PaginatedResponse<Route>> => {
  const { data } = await axiosInstance.get("/routes/", { params });
  return data;
};

export const getRoute = async (id: number): Promise<Route> => {
  const { data } = await axiosInstance.get(`/routes/${id}/`);
  return data;
};

export const createRoute = async (routeData: FormData): Promise<Route> => {
  const { data } = await axiosInstance.post("/routes/", routeData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const updateRoute = async (
  id: number,
  routeData: FormData,
): Promise<Route> => {
  const { data } = await axiosInstance.put(`/routes/${id}/`, routeData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const deleteRoute = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/routes/${id}/`);
};
