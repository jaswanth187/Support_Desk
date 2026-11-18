import { api, setAccessToken } from "./api";
import type { ApiResponse, AuthResponse, LoginPayload, RegisterPayload, User, UpdateProfilePayload, ChangePasswordPayload } from "../types/auth.types";

interface RegisterResponse {
    user: User;
}

export const authService = {

    async register(payload: RegisterPayload): Promise<User> {
        const response = await api.post<ApiResponse<RegisterResponse>>(
            "auth/register", payload
        );

        return response.data.data.user;
    },

    async login(payload: LoginPayload): Promise<AuthResponse> {
        const response = await api.post<ApiResponse<AuthResponse>>(
            "/auth/login", payload
        )

        const authData = response.data.data;
        setAccessToken(authData.accessToken);

        return authData;
    },

    async getCurrentUser(): Promise<User> {
        const response = await api.get<ApiResponse<User>>('/auth/me');
        return response.data.data;
    },

    async logOut(): Promise<void> {
        await api.post("/auth/logout");
    },

    async updateProfile(payload: UpdateProfilePayload): Promise<User> {
        const response = await api.patch<ApiResponse<User>>(
            "/auth/profile",
            payload
        );

        return response.data.data;
    },

    async changePassword(payload: ChangePasswordPayload): Promise<void> {
        await api.patch<ApiResponse<null>>(
            "/auth/change-password",
            payload
        );
    },
}