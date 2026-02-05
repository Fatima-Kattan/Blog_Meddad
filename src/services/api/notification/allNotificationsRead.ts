// notificationsReadAll.ts
import axios from "axios";
import type { Notification } from "./notifications";

export interface NotificationsResponse {
  data: Notification[];   
  message?: string;
}

export async function markAllAsRead(token: string): Promise<NotificationsResponse> {
  const response = await axios.put<NotificationsResponse>(
    "http://localhost:8000/api/v1/notifications/read-all",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );
  return response.data;
}

export const notificationsService = {
  markAllAsRead,
};