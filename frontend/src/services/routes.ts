import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import {
  Route,
  RoutePayload,
} from "@/types";

// Helper to create FormData from route payload
const createRouteFormData = (payload: RoutePayload): FormData => {
  const formData = new FormData();

  // Append all fields from the payload to formData
  Object.keys(payload).forEach((key) => {
    const value = payload[key as keyof RoutePayload];
    if (key === "image_card" || key === "image_map" || key === "gpx_file") {
      if (value instanceof FileList && value.length > 0) {
        formData.append(key, value[0]);
      } else if (value instanceof File) {
         formData.append(key, value);
      }
    } else if (value !== null && value !== undefined) {
      formData.append(key, value.toString());
    }
  });

  return formData;
};

// =================================================================================
// PUBLIC Routes API
// =================================================================================
interface FetchRoutesParams {
  search?: string;
  difficulty?: string;
}

const fetchPublicRoutes = async (
  params: FetchRoutesParams,
): Promise<Route[]> => {
  const { data } = await apiClient.get<Route[]>("/routes/", {
    params,
  });
  return data;
};

export const usePublicRoutes = (params: FetchRoutesParams) => {
  return useQuery<Route[], Error>({
    queryKey: ["publicRoutes", params],
    queryFn: () => fetchPublicRoutes(params),
  });
};


// =================================================================================
// ADMIN Routes API
// =================================================================================

const ADMIN_ROUTES_ENDPOINT = "/routes/admin/routes/";

const fetchAdminRoutes = async (
  params: FetchRoutesParams,
): Promise<Route[]> => {
  const { data } = await apiClient.get<Route[]>(ADMIN_ROUTES_ENDPOINT, {
    params,
  });
  return data;
};

// This hook is used by the Admin panel.
export const useRoutes = (params: FetchRoutesParams) => {
  return useQuery<Route[], Error>({
    queryKey: ["adminRoutes", params],
    queryFn: () => fetchAdminRoutes(params),

  });
};

const createRoute = async (payload: RoutePayload): Promise<Route> => {
  const formData = createRouteFormData(payload);
  const { data } = await apiClient.post(ADMIN_ROUTES_ENDPOINT, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const useCreateRoute = () => {
  const queryClient = useQueryClient();
  return useMutation<Route, Error, RoutePayload>({
    mutationFn: createRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRoutes"] });
    },
  });
};

const updateRoute = async ({
  id,
  payload,
}: {
  id: number;
  payload: RoutePayload;
}): Promise<Route> => {
  const formData = createRouteFormData(payload);
  const { data } = await apiClient.put(`${ADMIN_ROUTES_ENDPOINT}${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const useUpdateRoute = () => {
  const queryClient = useQueryClient();
  return useMutation<Route, Error, { id: number; payload: RoutePayload }>({
    mutationFn: updateRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRoutes"] });
    },
  });
};

const deleteRoute = async (id: number): Promise<void> => {
  await apiClient.delete(`${ADMIN_ROUTES_ENDPOINT}${id}/`);
};

export const useDeleteRoute = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteRoute,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRoutes"] });
    },
  });
};
