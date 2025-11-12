import { User } from "firebase/auth";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthUser {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  // TODO
}

export interface IAuthService {
  signIn: (data: LoginCredentials) => Promise<AuthUser | null>;
  signUp: (data: RegisterCredentials) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  verifyEmail: (email: string) => Promise<void>;
  recoverPassword: (email: string) => Promise<void>;
}
