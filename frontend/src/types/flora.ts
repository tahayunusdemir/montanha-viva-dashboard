export interface Plant {
  id: number;
  scientific_name: string;
  common_names: string;
  images: string[]; // JSONField in Django, comes as an array of strings
  interaction_fauna: string | null;
  food_uses: string | null;
  medicinal_uses: string | null;
  ornamental_uses: string | null;
  traditional_uses: string | null;
  aromatic_uses: string | null;
  uses_flags: {
    [key: string]: boolean; // e.g., { insects: true, decorative: false }
  };
  created_at: string;
  updated_at: string;
}
