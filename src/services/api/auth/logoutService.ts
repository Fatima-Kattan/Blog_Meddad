// services/api/logoutService.ts
import axios from 'axios';

export interface LogoutResponse {
    success: boolean;
    message: string;
    data?: any;
}

export const logoutService = {
    async logout(): Promise<LogoutResponse> {
        try {
            // Get token from localStorage
            const token = localStorage.getItem('token');
            
            if (!token) {
                return {
                    success: true,
                    message: 'Already logged out'
                };
            }

            const response = await axios.post<LogoutResponse>(
                'http://localhost:8000/api/v1/logout',
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Clear data from localStorage after successful API call
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('rememberedEmail');

            return response.data;
            
        } catch (error: any) {
            // Even if API fails, clear local data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('rememberedEmail');

            if (error.response) {
                throw new Error(error.response.data.message || 'Logout failed');
            }
            throw new Error('Network error. Please check your connection.');
        }
    },

    // Helper function to check if token exists
    isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    },

    // Function to get user data
    getUserData(): any {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    },

    // Function to get token
    getToken(): string | null {
        return localStorage.getItem('token');
    }
};