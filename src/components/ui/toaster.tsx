"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

type ToastVariant = "default" | "destructive" | "success";

type ToastInput = {
  description?: string;
  title: string;
  variant?: ToastVariant;
};

type ToastRecord = ToastInput & {
  id: string;
  open: boolean;
};

const listeners = new Set<(toast: ToastRecord) => void>();

export function toast(input: ToastInput) {
  const toastRecord: ToastRecord = {
    ...input,
    id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
    open: true,
  };

  for (const listener of listeners) {
    listener(toastRecord);
  }
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  useEffect(() => {
    function addToast(toastRecord: ToastRecord) {
      setToasts((currentToasts) => [toastRecord, ...currentToasts].slice(0, 5));
    }

    listeners.add(addToast);

    return () => {
      listeners.delete(addToast);
    };
  }, []);

  function removeToast(id: string) {
    setToasts((currentToasts) =>
      currentToasts.filter((toastRecord) => toastRecord.id !== id),
    );
  }

  return (
    <ToastProvider duration={4000} swipeDirection="right">
      {toasts.map((toastRecord) => (
        <Toast
          key={toastRecord.id}
          open={toastRecord.open}
          variant={toastRecord.variant}
          onOpenChange={(open) => {
            if (!open) {
              removeToast(toastRecord.id);
            }
          }}
        >
          <div>
            <ToastTitle>{toastRecord.title}</ToastTitle>
            {toastRecord.description ? (
              <ToastDescription>{toastRecord.description}</ToastDescription>
            ) : null}
          </div>
          <ToastClose aria-label="Close notification">
            <X className="size-4" />
          </ToastClose>
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
