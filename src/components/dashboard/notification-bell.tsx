"use client";

import { Bell, CheckCheck, Clock3 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/components/ui/toaster";
import type { NotificationRecord } from "@/lib/notifications";
import { cn } from "@/lib/utils";

type NotificationsResponse = {
  data: NotificationRecord[];
  unreadCount: number;
};

const notificationTypeStyle: Record<NotificationRecord["type"], string> = {
  certificate_created: "bg-emerald-500",
  certificate_deleted: "bg-red-500",
  certificate_expired: "bg-red-500",
  certificate_expiring: "bg-amber-500",
  certificate_updated: "bg-blue-500",
};

export function NotificationBell() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    const response = await fetch("/api/notifications");

    if (!response.ok) {
      setIsLoading(false);
      return;
    }

    const result = (await response.json()) as NotificationsResponse;
    setNotifications(result.data);
    setUnreadCount(result.unreadCount);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadNotifications();

    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [loadNotifications]);

  async function handleMarkRead() {
    const response = await fetch("/api/notifications", {
      method: "PATCH",
    });

    if (!response.ok) {
      toast({
        description: "Notifikasi belum berhasil ditandai sebagai sudah dibaca.",
        title: "Gagal menandai notifikasi",
        variant: "destructive",
      });
      return;
    }

    setUnreadCount(0);
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    );
    toast({
      description: "Semua notifikasi sudah ditandai sebagai sudah dibaca.",
      title: "Notifikasi sudah dibaca",
      variant: "success",
    });
  }

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);

        if (open) {
          void loadNotifications();
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative shrink-0">
          <Bell className="size-4" />
          {unreadCount > 0 ? (
            <span className="-top-1 -right-1 absolute grid min-w-5 place-items-center rounded-full bg-red-500 px-1.5 py-0.5 font-medium text-[10px] text-white leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
          <span className="sr-only">Notifikasi</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(390px,calc(100vw-2rem))]">
        <div className="flex items-center justify-between border-slate-100 border-b px-4 py-3">
          <div>
            <h2 className="font-semibold text-sm">Notifikasi</h2>
            <p className="text-slate-500 text-xs">
              Info perubahan data, audit, dan masa berlaku sertifikat.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => void handleMarkRead()}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="size-3.5" />
            Tandai dibaca
          </Button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {isLoading ? (
            <NotificationMessage message="Memuat notifikasi..." />
          ) : notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>
          ) : (
            <NotificationMessage message="Belum ada notifikasi." />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotificationItem({
  notification,
}: {
  notification: NotificationRecord;
}) {
  return (
    <article
      className={cn(
        "rounded-xl border border-slate-100 bg-white p-3 shadow-xs",
        !notification.isRead && "bg-slate-50",
      )}
    >
      <div className="flex gap-3">
        <span
          className={cn(
            "mt-1 size-2.5 rounded-full",
            notificationTypeStyle[notification.type],
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-medium text-sm">{notification.title}</h3>
            {!notification.isRead ? (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-600 text-[10px]">
                Baru
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-slate-600 text-xs leading-relaxed">
            {notification.message}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 text-[11px]">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3" />
              {formatNotificationTime(notification.createdAt)}
            </span>
            {notification.actorUsername ? (
              <span>Oleh {notification.actorUsername}</span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function NotificationMessage({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-slate-500 text-sm">
      {message}
    </div>
  );
}

function formatNotificationTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
