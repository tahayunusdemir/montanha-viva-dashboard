import axios from "@/lib/axios";
import { WeatherLocation, ForecastResponse } from "@/types/weather";

const getLocations = async (): Promise<WeatherLocation[]> => {
  const response = await axios.get<WeatherLocation[]>("/weather/locations/");
  return response.data;
};

const getForecast = async (locationId: number): Promise<ForecastResponse> => {
  const response = await axios.get<ForecastResponse>(
    `/weather/forecast/${locationId}/`,
  );
  return response.data;
};

export const weatherService = {
  getLocations,
  getForecast,
};