"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { sidebarItems } from "@/components/dashboard/dashboard-data";
import { cn } from "@/lib/utils";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="grid size-10 place-items-center rounded-2xl bg-sky-600 text-white">
          <CheckCircle2 className="size-5" />
        </div>
        <div>
          <p className="font-semibold">QSI CMS</p>
          <p className="text-slate-500 text-xs">Certification manager</p>
        </div>
      </div>

      <nav className="mt-6 space-y-1">
        {sidebarItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === item.href
              : item.href !== "#" && pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-sm transition-colors",
                isActive
                  ? "bg-sky-50 text-sky-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl bg-slate-50 p-4">
        <p className="font-medium text-sm">Need review</p>
        <p className="mt-1 text-slate-500 text-xs">
          3 certificates are waiting for approval.
        </p>
      </div>
    </div>
  );
}
