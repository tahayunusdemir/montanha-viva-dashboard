export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface ChangePasswordData {
  current_password?: string;
  new_password?: string;
  re_new_password?: string;
}

export interface PasswordResetRequestPayload {
  email: string;
}

export interface PasswordResetConfirmPayload {
  uidb64: string;
  token: string;
  new_password?: string;
  re_new_password?: string;
}
