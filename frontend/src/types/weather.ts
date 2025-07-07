// Types based on the IPMA API documentation

export interface WeatherLocation {
  idRegiao: number; // Region ID
  idAreaAviso: string; // Warning Area ID
  idConcelho: number; // Municipality ID
  globalIdLocal: number; // Global Location ID
  latitude: string;
  idDistrito: number; // District ID
  local: string; // Location name
  longitude: string;
}

export interface WeatherForecast {
  precipitaProb: string; // Precipitation probability
  tMin: string; // Minimum temperature
  tMax: string; // Maximum temperature
  predWindDir: string; // Predicted wind direction
  idWeatherType: number;
  classWindSpeed: number;
  longitude: string;
  forecastDate: string;
  latitude: string;
  classPrecInt?: number; // Precipitation intensity class
}

export interface ForecastResponse {
  owner: string;
  country: string;
  data: WeatherForecast[];
  globalIdLocal: number;
  dataUpdate: string;
}
