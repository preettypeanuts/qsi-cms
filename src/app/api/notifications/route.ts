import { getNotifications, markNotificationsAsRead } from "@/lib/notifications";

export async function GET() {
  const { notifications, unreadCount } = await getNotifications();

  return Response.json({ data: notifications, unreadCount });
}

export async function PATCH() {
  await markNotificationsAsRead();

  return Response.json({ data: { success: true } });
}
