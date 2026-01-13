import axios from "axios";

// واجهة الاستجابة من الـ API عند إنشاء الفولو
export interface CreateFollowResponse {
  message: string; // ممكن يرجع رسالة نجاح مثل "Follow created successfully"
  data?: any;      // إذا الـ API بيرجع بيانات إضافية (مثلاً العلاقة الجديدة)
}

// خدمة إنشاء الفولو
export const followService = {
  async createFollow(token: string, followingId: number): Promise<CreateFollowResponse> {
    try {
      const response = await axios.post<CreateFollowResponse>(
        "http://127.0.0.1:8000/api/v1/follows",
        {
          following_id: followingId
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
            "Content-Type": "application/json"
          }
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to create follow");
      }
      throw new Error("Network error. Please check your connection.");
    }
  }
};