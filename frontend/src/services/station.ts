import api from "../lib/axios";
import {
  Station,
  StationPayload,
  Measurement,
  StationDataAvailability,
} from "../types";

const stationService = {
  getStations: async (): Promise<Station[]> => {
    const { data } = await api.get<Station[]>("/stations/");
    return data;
  },

  getStationDataAvailability: async (
    stationId: string,
  ): Promise<StationDataAvailability> => {
    const { data } = await api.get<StationDataAvailability>(
      `/stations/${stationId}/availability/`,
    );
    return data;
  },

  getMeasurements: async (
    stationId: string,
    start: string,
    end: string,
  ): Promise<Measurement[]> => {
    const params = new URLSearchParams({
      station_id: stationId,
      start,
      end,
    });
    const { data } = await api.get<Measurement[]>(
      `/measurements/?${params.toString()}`,
    );
    return data;
  },

  createStation: async (stationData: StationPayload): Promise<Station> => {
    const { data } = await api.post<Station>("/stations/", stationData);
    return data;
  },

  updateStation: async (
    stationId: string,
    stationData: StationPayload,
  ): Promise<Station> => {
    const { data } = await api.put<Station>(
      `/stations/${stationId}/`,
      stationData,
    );
    return data;
  },

  deleteStation: async (stationId: string): Promise<void> => {
    await api.delete(`/stations/${stationId}/`);
  },

  downloadMeasurementsCsv: async (
    stationId: string,
    start: string,
    end: string,
  ): Promise<string> => {
    const params = new URLSearchParams({
      station_id: stationId,
      start,
      end,
      format: "csv",
    });
    const { data } = await api.get<string>(
      `/measurements/?${params.toString()}`,
      {
        headers: {
          Accept: "text/csv",
        },
      },
    );
    return data;
  },
};

export default stationService;
