import axios from "axios";

// واجهة الاستجابة من الـ API عند الحذف
export interface DeleteResponse {
  message: string; // السيرفر عادة بيرجع رسالة نجاح أو خطأ
}

// خدمة الـ follows (الحذف)
export const followsService = {
  async deleteFollow(userId: number, token: string): Promise<DeleteResponse> {
    try {
      const response = await axios.delete<DeleteResponse>(
        `http://127.0.0.1:8000/api/v1/follows/${userId}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to delete follow");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },
};