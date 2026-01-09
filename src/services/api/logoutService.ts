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
            // جلب التوكن من localStorage
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

            // مسح البيانات من localStorage بعد نجاح الـ API
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('rememberedEmail');

            return response.data;
            
        } catch (error: any) {
            // حتى لو حصل خطأ في الـ API، نمسح البيانات المحلية
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('rememberedEmail');

            if (error.response) {
                throw new Error(error.response.data.message || 'Logout failed');
            }
            throw new Error('Network error. Please check your connection.');
        }
    },

    // دالة مساعدة للتحقق من وجود توكن
    isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    },

    // دالة للحصول على بيانات المستخدم
    getUserData(): any {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    },

    // دالة للحصول على التوكن
    getToken(): string | null {
        return localStorage.getItem('token');
    }
};