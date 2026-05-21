"use client";

import { Toast as ToastPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitive.Provider;

function ToastViewport({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      className={cn(
        "fixed top-0 right-0 z-100 flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:top-auto sm:bottom-0 sm:max-w-sm",
        className,
      )}
      {...props}
    />
  );
}

function Toast({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Root> & {
  variant?: "default" | "destructive" | "success";
}) {
  return (
    <ToastPrimitive.Root
      className={cn(
        "group pointer-events-auto relative grid w-full grid-cols-[1fr_auto] items-start gap-3 overflow-hidden rounded-2xl border bg-white p-4 text-slate-950 shadow-lg transition-all data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full data-[state=open]:animate-in data-[state=closed]:animate-out",
        variant === "default" && "border-slate-200",
        variant === "success" && "border-emerald-200 bg-emerald-50",
        variant === "destructive" && "border-red-200 bg-red-50",
        className,
      )}
      {...props}
    />
  );
}

function ToastTitle({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Title>) {
  return (
    <ToastPrimitive.Title
      className={cn("font-semibold text-sm", className)}
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Description>) {
  return (
    <ToastPrimitive.Description
      className={cn("mt-1 text-slate-600 text-sm", className)}
      {...props}
    />
  );
}

function ToastClose({
  className,
  ...props
}: React.ComponentProps<typeof ToastPrimitive.Close>) {
  return (
    <ToastPrimitive.Close
      className={cn(
        "rounded-md p-1 text-slate-400 transition hover:bg-white/70 hover:text-slate-700",
        className,
      )}
      {...props}
    />
  );
}

export {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
};
