import axios from "axios";

// واجهة المستخدم اللي مش متابعينه
export interface NotFollowingUser {
  id: number;
  full_name: string;
  bio?: string;
  email: string;
  phone_number: string;
  email_verified_at?: string | null;
  birth_date: string;
  gender: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

// واجهة الاستجابة من الـ API
export interface NotFollowingResponse {
  count: number;
  data: NotFollowingUser[];
}

// خدمة الـ not-followings
export const notFollowingService = {
  async getNotFollowings(userId: number, token: string): Promise<NotFollowingResponse> {
    try {
      const response = await axios.get<NotFollowingResponse>(
        `http://127.0.0.1:8000/api/v1/users/${userId}/not-followings`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Failed to fetch not-followings");
      }
      throw new Error("Network error. Please check your connection.");
    }
  }
};