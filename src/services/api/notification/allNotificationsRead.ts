// notificationsReadAll.ts
import axios from "axios";
import type { Notification } from "./notifications";

export interface NotificationsResponse {
  data: Notification[];   // لأنك رح ترجع غالباً كل الإشعارات بعد التحديث
  message?: string;
}

// دالة مستقلة
export async function markAllAsRead(token: string): Promise<NotificationsResponse> {
  const response = await axios.put<NotificationsResponse>(
    "http://localhost:8000/api/v1/notifications/read-all",
    {}, // ما في body مطلوب
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );
  return response.data;
}

// كائن خدمة (بيعتمد على نفس الدالة)
export const notificationsService = {
  markAllAsRead,
};