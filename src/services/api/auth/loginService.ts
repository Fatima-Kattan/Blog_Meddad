// src/services/api/loginService.ts
import axios from 'axios';

export interface LoginData {
    login: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        user: {
            id: number;
            full_name: string;
            email: string;
            phone_number: string;
            bio?: string;
            birth_date: string;
            gender: string;
            image?: string;
            created_at: string;
            updated_at: string;
        };
        token: string;
        token_type: string;
        expires_at: string;
    };
}

export const loginService = {
    async login(data: LoginData): Promise<LoginResponse> {
        try {
            const response = await axios.post<LoginResponse>(
                'http://localhost:8000/api/v1/login',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Login failed');
            }
            throw new Error('Network error. Please check your connection.');
        }
    },

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    }
};