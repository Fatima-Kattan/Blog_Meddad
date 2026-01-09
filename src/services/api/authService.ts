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
    image?: File | null;
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

// src/services/api/authService.ts


class AuthService {
    private baseURL = '/api/v1';
    
    async register(data: RegisterData): Promise<RegisterResponse> {
        const url = `${this.baseURL}/register`;
        console.log('🌐 Sending JSON to:', url);
        
        // ⬇️ أعد تحضير البيانات للـ JSON
        const jsonData: any = {
            full_name: data.full_name,
            email: data.email,
            password: data.password,
            password_confirmation: data.password_confirmation,
            phone_number: data.phone_number,
            birth_date: data.birth_date,
            gender: data.gender,
        };
        
        // ⬇️ أضف الحقول الاختيارية إذا موجودة
        if (data.bio && data.bio.trim() !== '') {
            jsonData.bio = data.bio;
        }
        
        // ⚠️ مشكلة: الصورة ما بتقدر ترسلها في JSON
        // إذا كان API يطلب JSON فقط، ما راح تقدر ترسل ملفات
        // الحل: إما ترفع الصورة بشكل منفصل أو تستخدم base64
        
        /* console.log('📦 JSON Data to send:', jsonData); */
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(jsonData),//بتحول لجيسون
            });
            
            const responseText = await response.text();
            console.log('📨 Response status:', response.status);
            console.log('📄 Response (first 500 chars):', responseText.substring(0, 500));
            
            // تحقق إذا كان HTML
            if (responseText.trim().startsWith('<!DOCTYPE')) {
                console.error('❌ Server returned HTML!');
                throw new Error(`Server error ${response.status}: Received HTML page`);
            }
            
            // حاول تحليل الـ JSON
            try {
                const result = JSON.parse(responseText);
                
                if (!response.ok) {
                    throw new Error(result.message || `HTTP ${response.status}: ${JSON.stringify(result)}`);
                }
                
                console.log('✅ Registration successful!');
                return result;
                
            } catch (jsonError) {
                console.error('❌ JSON parse error:', jsonError);
                throw new Error(`Invalid JSON from server: ${responseText.substring(0, 200)}`);
            }
            
        } catch (error: any) {
            console.error('🔥 Request failed:', error);
            throw error;
        }
    }
}
export const authService = new AuthService();
