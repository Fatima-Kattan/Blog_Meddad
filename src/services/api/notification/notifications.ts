// notifications.ts
import axios from "axios";

export interface Actor {
  id: number;
  full_name: string;
  image: string;
}

export interface Notification {
  id: number;
  user_id: number;
  actor_id: number;
  type: string;
  post_id?: number | null;
  comment_id?: number | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  actor: Actor;
}

export interface NotificationsResponse {
  count: number;
  data: Notification[];
}



export const notificationsService = {
  async getNotifications(token: string): Promise<NotificationsResponse> {
    const response = await axios.get<NotificationsResponse>(
      "http://localhost:8000/api/v1/notifications",
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      }
    );
    return response.data;
  },
};