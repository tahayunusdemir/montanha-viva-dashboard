import api from "@/lib/axios";
import { Plant, PlantPayload } from "@/types";

const getPlants = async (): Promise<Plant[]> => {
  const response = await api.get<Plant[]>("/flora/plants/");
  return response.data;
};

const createPlant = async (data: PlantPayload): Promise<Plant> => {
  const response = await api.post<Plant>("/flora/plants/", data);
  return response.data;
};

const updatePlant = async ({
  id,
  data,
}: {
  id: number;
  data: PlantPayload;
}): Promise<Plant> => {
  const response = await api.put<Plant>(`/flora/plants/${id}/`, data);
  return response.data;
};

const deletePlant = async (id: number): Promise<void> => {
  await api.delete(`/flora/plants/${id}/`);
};

const uploadPlantImage = async (
  formData: FormData,
): Promise<{ id: number; image: string }> => {
  const response = await api.post<{ id: number; image: string }>(
    "/flora/plants/upload_image/",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

const floraService = {
  getPlants,
  createPlant,
  updatePlant,
  deletePlant,
  uploadPlantImage,
};

export default floraService;
