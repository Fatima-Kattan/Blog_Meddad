import axios from "axios";

export interface FollowingUser {
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

export interface FollowingData {
  id: number;
  follower_id: number;
  following_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  following: FollowingUser;
}

export interface FollowingResponse {
  count: number;
  data: FollowingData[];
}

export const followingService = {
  async getFollowings(userId: number, token: string): Promise<FollowingResponse> {
    try {
      const response = await axios.get<FollowingResponse>(
        `http://127.0.0.1:8000/api/v1/users/${userId}/followings`,
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
        throw new Error(error.response.data.message || "Failed to fetch followings");
      }
      throw new Error("Network error. Please check your connection.");
    }
  }
};