// src/services/api/authService.ts
export interface RegisterData {
    full_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone_number: string;
    bio?: string;
    birth_date: string;
    gender: 'male' | 'female';
    image?: string;
}
export interface RegisterResponse {
    success: boolean;
    message: string;
    data: {
        user: {
            id: number;
            full_name: string;
            email: string;
            phone_number: string;
            bio: string | null;
            birth_date: string;
            gender: string;
            image: string | null;
            created_at: string;
            updated_at: string;
        };
        token: string;
        token_type: string;
    };
}
class AuthService {
    private baseURL = 'http://localhost:8000/api/v1';

    async register(data: RegisterData): Promise<RegisterResponse> {
        const url = `${this.baseURL}/register`;
        console.log('🌐 Sending FormData to:', url);

        const formData = new FormData();

        // Add all fields as FormData
        formData.append('full_name', data.full_name);
        formData.append('email', data.email);
        formData.append('password', data.password);
        formData.append('password_confirmation', data.password_confirmation);
        formData.append('phone_number', data.phone_number);
        formData.append('birth_date', data.birth_date);
        formData.append('gender', data.gender);

        if (data.bio && data.bio.trim() !== '') {
            formData.append('bio', data.bio);
        }
        if (data.image && data.image.trim() !== '') {
            formData.append('image', data.image);
        }

        // 🔍 Check FormData contents (for debugging only)
        for (let [key, value] of formData.entries()) {
            console.log(`📝 ${key}:`, value);
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    // ⚠️ Do not add 'Content-Type' here - fetch will add it automatically with boundary for FormData
                    'Accept': 'application/json',
                    // If you need token:
                    // 'Authorization': `Bearer ${token}`
                },
                body: formData, // ⭐ Send FormData instead of JSON
            });

            const responseText = await response.text();
            console.log('📨 Response status:', response.status);
            console.log('📄 Response (first 500 chars):', responseText.substring(0, 500));

            // Check if it's HTML
            if (responseText.trim().startsWith('<!DOCTYPE')) {
                console.error('❌ Server returned HTML!');

                // 🔍 Log full HTML for diagnosis help
                console.error('📄 Full HTML response (first 1000 chars):', responseText.substring(0, 1000));

                throw new Error(`Server error ${response.status}: Received HTML page`);
            }

            // Try to parse JSON
            try {
                const result = JSON.parse(responseText);

                if (!response.ok) {
                    console.error('❌ API Error:', result);
                    throw new Error(result.message || `HTTP ${response.status}: ${JSON.stringify(result)}`);
                }

                console.log('✅ Registration successful!');
                return result;

            } catch (jsonError) {
                console.error('❌ JSON parse error:', jsonError);
                console.error('📄 Raw response:', responseText);
                throw new Error(`Invalid JSON from server: ${responseText.substring(0, 200)}`);
            }

        } catch (error: any) {
            console.error('🔥 Request failed:', error);
            throw error;
        }
    }
}
export const authService = new AuthService();