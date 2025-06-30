import api from "@/lib/axios";
import { Plant } from "@/types/flora";

// The base URL for the flora endpoints
const floraBaseURL = "/flora/";

/**
 * Fetches a paginated list of plants.
 * @returns A promise that resolves to an array of plants.
 */
export const getPlants = async (): Promise<Plant[]> => {
  const { data } = await api.get(floraBaseURL);
  // Assuming the API returns the list directly. If it's paginated,
  // the response structure might be { results: [...] }
  return data.results || data;
};

/**
 * Fetches a single plant by its ID.
 * @param id The ID of the plant to fetch.
 * @returns A promise that resolves to the plant data.
 */
export const getPlantById = async (id: number): Promise<Plant> => {
  const { data } = await api.get(`${floraBaseURL}${id}/`);
  return data;
};

/**
 * Creates a new plant.
 * @param plantData The data for the new plant.
 * @returns A promise that resolves to the created plant data.
 */
export const createPlant = async (
  plantData: Omit<Plant, "id" | "created_at" | "updated_at">,
): Promise<Plant> => {
  const { data } = await api.post(floraBaseURL, plantData);
  return data;
};

/**
 * Updates an existing plant.
 * @param id The ID of the plant to update.
 * @param plantData The updated data for the plant.
 * @returns A promise that resolves to the updated plant data.
 */
export const updatePlant = async (
  id: number,
  plantData: Partial<Plant>,
): Promise<Plant> => {
  const { data } = await api.patch(`${floraBaseURL}${id}/`, plantData);
  return data;
};

/**
 * Deletes a plant by its ID.
 * @param id The ID of the plant to delete.
 * @returns A promise that resolves when the plant is deleted.
 */
export const deletePlant = async (id: number): Promise<void> => {
  await api.delete(`${floraBaseURL}${id}/`);
};
