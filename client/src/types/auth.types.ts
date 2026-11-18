export type UserRole = "ADMIN" | "AGENT" | "CUSTOMER";
export interface User{
    id: string;
    name: string;
    email:string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse{
    accessToken: string;
    user: User;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}

export interface LoginPayload{
    email:string;
    password: string;
}

export interface ApiResponse<T>{
    success: boolean;
    message: string;
    data: T;
}

export interface UpdateProfilePayload {
  name: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}