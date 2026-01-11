import axios from "axios";

// واجهة المستخدم اللي متابعك
export interface FollowerUser {
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

// واجهة العلاقة (follower/following)
export interface FollowerData {
  id: number;
  follower_id: number;
  following_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  follower: FollowerUser; // لاحظ هون بدل following صار follower
}

// واجهة الاستجابة من الـ API
export interface FollowersResponse {
  count: number;
  data: FollowerData[];
}

// خدمة الـ followers
export const followersService = {
  async getFollowers(userId: number, token: string): Promise<FollowersResponse> {
    try {
      const response = await axios.get<FollowersResponse>(
        `http://127.0.0.1:8000/api/v1/users/${userId}/followers`,
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
        throw new Error(error.response.data.message || "Failed to fetch followers");
      }
      throw new Error("Network error. Please check your connection.");
    }
  },
};