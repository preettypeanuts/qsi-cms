import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  XCircle,
} from "lucide-react";

export type CertificateStatus = "Aktif" | "Nonaktif" | "Kadaluarsa";

export type CertificateRecord = {
  id: string;
  auditor: string;
  company: string;
  expiryDate: string;
  issuedDate: string;
  standard: string;
  status: CertificateStatus;
  surveillance1: string;
  surveillance2: string;
};

export type SidebarItem = {
  label: string;
  icon: LucideIcon;
  href: string;
  isExternal?: boolean;
};

export type DashboardStat = {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  iconClassName: string;
};

export const certificates: CertificateRecord[] = [
  {
    id: "202508001001HCK007",
    auditor: "Yudi Defitra",
    company: "PT Pawon Sae Nusantara",
    expiryDate: "2028-08-29",
    issuedDate: "2025-08-28",
    standard: "ISO 22000:2018",
    status: "Aktif",
    surveillance1: "2026-08-28",
    surveillance2: "2027-08-28",
  },
];

export const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Certificates", icon: BadgeCheck, href: "/certificate" },
  { label: "Logout", icon: LogOut, href: "/api/auth/logout", isExternal: true },
];

export const statusVariant = {
  Aktif: "active",
  Kadaluarsa: "expired",
  Nonaktif: "inactive",
} as const;

export function getDashboardStats(
  sourceCertificates: CertificateRecord[] = certificates,
): DashboardStat[] {
  return [
    {
      title: "Total Certificates",
      value: sourceCertificates.length,
      description: "All certification records",
      icon: FileText,
      iconClassName: "bg-sky-50 text-sky-600",
    },
    {
      title: "Active Certificates",
      value: sourceCertificates.filter((item) => item.status === "Aktif")
        .length,
      description: "Currently valid certificates",
      icon: ShieldCheck,
      iconClassName: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Inactive Certificates",
      value: sourceCertificates.filter((item) => item.status === "Nonaktif")
        .length,
      description: "Paused or inactive records",
      icon: XCircle,
      iconClassName: "bg-slate-100 text-slate-600",
    },
  ];
}
