export interface PlantImage {
  id: number;
  image: string;
}

export interface Plant {
  id: number;
  scientific_name: string;
  common_names: string;
  interaction_fauna: string | null;
  food_uses: string | null;
  medicinal_uses: string | null;
  ornamental_uses: string | null;
  traditional_uses: string | null;
  aromatic_uses: string | null;
  uses: {
    [key: string]: boolean;
  };
  images: PlantImage[];
  created_at: string;
}

export interface PlantPayload {
  scientific_name: string;
  common_names: string;
  interaction_fauna: string | null;
  food_uses: string | null;
  medicinal_uses: string | null;
  ornamental_uses: string | null;
  traditional_uses: string | null;
  aromatic_uses: string | null;
  uses?: {
    [key: string]: boolean;
  };
  uploaded_image_ids?: number[];
}
