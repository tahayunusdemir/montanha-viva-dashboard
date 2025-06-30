export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}
