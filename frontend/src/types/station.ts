export interface Station {
  station_id: string;
  name: string;
  location: string;
  is_active: boolean;
  created_at: string;
}

export type StationPayload = {
  station_id: string;
  name: string;
  location: string;
  is_active: boolean;
};

export interface Measurement {
  measurement_type: string;
  value: number;
  recorded_at: string;
}

export interface StationDataAvailability {
  station_id: string;
  min_date: string;
  max_date: string;
}
