export interface AdminUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: "Super Admin" | "Admin" | "User";
  date_joined: string; // ISO 8601 date string
  points: number;
  is_staff: boolean;
  is_active: boolean;
}

export type UserUpdatePayload = {
  is_staff?: boolean;
  is_active?: boolean;
};

export type CreateUserPayload = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  re_password: string;
  is_staff: boolean;
};
