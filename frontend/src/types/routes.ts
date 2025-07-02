export interface PointOfInterest {
  id: number;
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

export interface Route {
  id: number;
  name: string;
  distance_km: number;
  duration: string;
  route_type: "circular" | "linear";
  difficulty: "Easy" | "Medium" | "Hard";
  altitude_min_m: number;
  altitude_max_m: number;
  accumulated_climb_m: number;
  start_point_gps?: string;
  description: string;
  points_of_interest?: string;
  image_card?: string;
  image_map?: string;
  gpx_file?: string;
  created_at: string;
  updated_at: string;
}

export interface RoutePayload {
  name: string;
  distance_km: number;
  duration: string;
  route_type: "circular" | "linear";
  difficulty: "Easy" | "Medium" | "Hard";
  altitude_min_m: number;
  altitude_max_m: number;
  accumulated_climb_m: number;
  start_point_gps?: string;
  description: string;
  points_of_interest?: string;
  image_card?: File | null;
  image_map?: File | null;
  gpx_file?: File | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
