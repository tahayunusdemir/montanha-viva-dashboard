export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_staff: boolean;
  points: number;
}

export interface Tokens {
  access: string;
  refresh?: string;
}

export interface AuthResponse extends Tokens {
  user: User;
}
