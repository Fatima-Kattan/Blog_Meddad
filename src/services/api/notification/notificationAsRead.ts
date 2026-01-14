// notificationsAsRead.ts
import axios from "axios";
import type { Notification } from "./notifications";

export interface NotificationResponse {
  data: Notification;
  message?: string;
}

export const notificationsService = {
  async markAsRead(id: number, token: string): Promise<NotificationResponse> {
    const response = await axios.put<NotificationResponse>(
      `http://localhost:8000/api/v1/notifications/${id}/read`,
      {},
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