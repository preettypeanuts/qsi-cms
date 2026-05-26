"use client";

import { PanelLeftClose, PanelLeftOpen, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

type DashboardSidebarProps = {
  allowCollapse?: boolean;
};

type CurrentUser = {
  username: string;
};

export function DashboardSidebar({
  allowCollapse = true,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    if (!allowCollapse) {
      setIsCollapsed(false);
      return;
    }

    setIsCollapsed(localStorage.getItem("qsi-sidebar-collapsed") === "true");
  }, [allowCollapse]);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });

        if (!response.ok) {
          return;
        }

        const result = (await response.json()) as { data?: CurrentUser };

        if (isMounted && result.data?.username) {
          setCurrentUser(result.data);
        }
      } catch {
        // User info is supplemental; route protection still handles auth state.
      }
    }

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleToggleSidebar() {
    setIsCollapsed((currentValue) => {
      const nextValue = !currentValue;
      localStorage.setItem("qsi-sidebar-collapsed", String(nextValue));

      return nextValue;
    });
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col transition-[width] duration-300 ease-in-out",
        allowCollapse ? (isCollapsed ? "w-14" : "w-56") : "w-full",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 px-2 py-3",
          isCollapsed && "flex-col gap-2 px-0",
        )}
      >
        <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-2xl border border-slate-100 bg-white">
          <Image
            src="/logo.png"
            alt="Logo QSI"
            width={32}
            height={32}
            className="size-8 object-contain"
            priority
          />
        </div>
        {isCollapsed ? null : (
          <div className="min-w-0">
            <p className="font-semibold">QSI CMS</p>
            <p className="text-slate-500 text-xs">Pengelola sertifikat</p>
          </div>
        )}
        {allowCollapse ? (
          <button
            type="button"
            className={cn(
              "grid size-8 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950",
              !isCollapsed && "ml-auto",
            )}
            onClick={handleToggleSidebar}
            aria-label={isCollapsed ? "Buka sidebar" : "Minimize sidebar"}
            title={isCollapsed ? "Buka sidebar" : "Minimize sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </button>
        ) : null}
      </div>

      <nav className="mt-6 space-y-1">
        {sidebarItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === item.href
              : item.href !== "#" && pathname.startsWith(item.href);
          const className = cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-sm transition-colors",
            isCollapsed && "justify-center px-0",
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
                title={item.label}
              >
                <item.icon className="size-4" />
                {isCollapsed ? (
                  <span className="sr-only">{item.label}</span>
                ) : (
                  item.label
                )}
              </button>
            );
          }

          if (item.isExternal) {
            return (
              <a
                key={item.label}
                href={item.href}
                className={className}
                title={item.label}
              >
                <item.icon className="size-4" />
                {isCollapsed ? (
                  <span className="sr-only">{item.label}</span>
                ) : (
                  item.label
                )}
              </a>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={className}
              title={item.label}
            >
              <item.icon className="size-4" />
              {isCollapsed ? (
                <span className="sr-only">{item.label}</span>
              ) : (
                item.label
              )}
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

      <div
        className={cn(
          "mt-auto border border-slate-100 bg-slate-50",
          isCollapsed
            ? "grid place-items-center rounded-2xl p-2"
            : "rounded-2xl p-3",
        )}
        title={
          currentUser?.username
            ? `Login sebagai ${currentUser.username}`
            : "Memuat user login"
        }
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-sky-700 shadow-sm">
            <UserRound className="size-4" />
          </div>
          {isCollapsed ? null : (
            <div className="min-w-0">
              <p className="text-slate-500 text-xs">Login sebagai</p>
              <p className="truncate font-semibold text-slate-900 text-sm">
                {currentUser?.username ?? "Memuat user..."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
