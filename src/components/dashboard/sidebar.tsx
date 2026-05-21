"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { sidebarItems } from "@/components/dashboard/dashboard-data";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="grid size-10 place-items-center rounded-2xl bg-sky-600 text-white">
          <CheckCircle2 className="size-5" />
        </div>
        <div>
          <p className="font-semibold">QSI CMS</p>
          <p className="text-slate-500 text-xs">Pengelola sertifikat</p>
        </div>
      </div>

      <nav className="mt-6 space-y-1">
        {sidebarItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === item.href
              : item.href !== "#" && pathname.startsWith(item.href);
          const className = cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-sm transition-colors",
            isActive
              ? "bg-sky-50 text-sky-700"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
          );

          if (item.href === "/api/auth/logout") {
            return (
              <button
                key={item.label}
                type="button"
                className={className}
                onClick={() => setIsLogoutDialogOpen(true)}
              >
                <item.icon className="size-4" />
                {item.label}
              </button>
            );
          }

          if (item.isExternal) {
            return (
              <a key={item.label} href={item.href} className={className}>
                <item.icon className="size-4" />
                {item.label}
              </a>
            );
          }

          return (
            <Link key={item.label} href={item.href} className={className}>
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <AlertDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Keluar dari CMS?</AlertDialogTitle>
            <AlertDialogDescription>
              Session kamu akan diakhiri dan kamu perlu login lagi untuk masuk
              ke CMS.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                window.location.href = "/api/auth/logout";
              }}
            >
              Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mt-auto rounded-2xl bg-slate-50 p-4">
        <p className="font-medium text-sm">Perlu ditinjau</p>
        <p className="mt-1 text-slate-500 text-xs">
          Pantau notifikasi untuk melihat perubahan data dan masa berlaku
          sertifikat.
        </p>
      </div>
    </div>
  );
}
