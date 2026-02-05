import axios from "axios";

export interface CreateFollowResponse {
  message: string; 
  data?: any;     
}

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