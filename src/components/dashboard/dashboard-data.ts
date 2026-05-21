import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  XCircle,
} from "lucide-react";

export type CertificateStatus = "Active" | "Inactive" | "Expired";

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
    id: "QSI-9001-001",
    auditor: "Sarah Wijaya",
    company: "Atlas Manufacturing",
    expiryDate: "12 Jan 2029",
    issuedDate: "12 Jan 2026",
    standard: "ISO 9001",
    status: "Active",
    surveillance1: "12 Jan 2027",
    surveillance2: "12 Jan 2028",
  },
  {
    id: "QSI-22000-014",
    auditor: "Dewi Anggara",
    company: "Nusantara Food Labs",
    expiryDate: "04 Feb 2029",
    issuedDate: "04 Feb 2026",
    standard: "ISO 22000",
    status: "Active",
    surveillance1: "04 Feb 2027",
    surveillance2: "04 Feb 2028",
  },
  {
    id: "QSI-HACCP-028",
    auditor: "Rangga Putra",
    company: "Mandala Cold Chain",
    expiryDate: "18 Mar 2026",
    issuedDate: "18 Mar 2023",
    standard: "HACCP",
    status: "Expired",
    surveillance1: "18 Mar 2024",
    surveillance2: "18 Mar 2025",
  },
  {
    id: "QSI-GMP-041",
    auditor: "Bima Prasetyo",
    company: "Sagara Pharma",
    expiryDate: "22 Apr 2028",
    issuedDate: "22 Apr 2025",
    standard: "GMP",
    status: "Inactive",
    surveillance1: "22 Apr 2026",
    surveillance2: "22 Apr 2027",
  },
  {
    id: "QSI-9001-052",
    auditor: "Sarah Wijaya",
    company: "Citra Agro Supply",
    expiryDate: "08 May 2029",
    issuedDate: "08 May 2026",
    standard: "ISO 9001",
    status: "Active",
    surveillance1: "08 May 2027",
    surveillance2: "08 May 2028",
  },
  {
    id: "QSI-22000-067",
    auditor: "Dewi Anggara",
    company: "Tirta Fresh Foods",
    expiryDate: "14 May 2028",
    issuedDate: "14 May 2025",
    standard: "ISO 22000",
    status: "Inactive",
    surveillance1: "14 May 2026",
    surveillance2: "14 May 2027",
  },
];

export const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Certificates", icon: BadgeCheck, href: "/certificate" },
  { label: "Logout", icon: LogOut, href: "#" },
];

export const statusVariant = {
  Active: "active",
  Inactive: "inactive",
  Expired: "expired",
} as const;

export function getDashboardStats(): DashboardStat[] {
  return [
    {
      title: "Total Certificates",
      value: certificates.length,
      description: "All certification records",
      icon: FileText,
      iconClassName: "bg-sky-50 text-sky-600",
    },
    {
      title: "Active Certificates",
      value: certificates.filter((item) => item.status === "Active").length,
      description: "Currently valid certificates",
      icon: ShieldCheck,
      iconClassName: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Inactive Certificates",
      value: certificates.filter((item) => item.status === "Inactive").length,
      description: "Paused or inactive records",
      icon: XCircle,
      iconClassName: "bg-slate-100 text-slate-600",
    },
  ];
}
