import api from "@/lib/api";
import { IApiResponse } from "@/types/api-response.types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthData {
  message: string;
  token: string;
  user: User;
}

export const login = async (credentials: LoginRequest) => {
  const response = await api.post<IApiResponse<AuthData>>("/auth/signin", credentials);
  return response.data;
};

export const signup = async (userData: SignupRequest) => {
  const response = await api.post<IApiResponse<AuthData>>("/auth/signup", userData);
  return response.data;
};

export const logout = async () => {
  const response = await api.post<IApiResponse<{ message: string }>>("/auth/logout");
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get<IApiResponse<{ user: User }>>("/auth/profile");
  return response.data;
};

export const validateSession = async () => {
  const response = await api.get<IApiResponse<{ user: User }>>("/auth/validate");
  if (!response.data.success) {
    throw new Error(response.data.error?.message || "Session validation failed");
  }
  return response.data as IApiResponse<{ user: User }>;
};
