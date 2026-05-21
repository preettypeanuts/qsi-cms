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
    id: "QSI-FOOD-001",
    auditor: "Yudi Defitra",
    company: "PT Pawon Sae Nusantara",
    expiryDate: getRelativeDateValue(730),
    issuedDate: getRelativeDateValue(-365),
    standard: "ISO 22000:2018",
    status: "Aktif",
    surveillance1: getRelativeDateValue(-180),
    surveillance2: getRelativeDateValue(180),
  },
  {
    id: "QSI-MFG-002",
    auditor: "Dewi Anggraini",
    company: "PT Atlas Manufacturing",
    expiryDate: getRelativeDateValue(540),
    issuedDate: getRelativeDateValue(-420),
    standard: "ISO 9001",
    status: "Aktif",
    surveillance1: getRelativeDateValue(-240),
    surveillance2: getRelativeDateValue(120),
  },
  {
    id: "QSI-HACCP-003",
    auditor: "Rizky Pratama",
    company: "CV Sari Laut Mandiri",
    expiryDate: getRelativeDateValue(420),
    issuedDate: getRelativeDateValue(-500),
    standard: "HACCP",
    status: "Aktif",
    surveillance1: getRelativeDateValue(-300),
    surveillance2: getRelativeDateValue(90),
  },
  {
    id: "QSI-GMP-004",
    auditor: "Nadia Putri",
    company: "PT Herbal Prima Sehat",
    expiryDate: getRelativeDateValue(365),
    issuedDate: getRelativeDateValue(-360),
    standard: "GMP",
    status: "Aktif",
    surveillance1: getRelativeDateValue(-180),
    surveillance2: getRelativeDateValue(60),
  },
  {
    id: "QSI-ISO22-005",
    auditor: "Bima Satria",
    company: "PT Rasa Nusantara Food",
    expiryDate: getRelativeDateValue(250),
    issuedDate: getRelativeDateValue(-520),
    standard: "ISO 22000",
    status: "Aktif",
    surveillance1: getRelativeDateValue(-360),
    surveillance2: getRelativeDateValue(-30),
  },
  {
    id: "QSI-NON-006",
    auditor: "Laras Wulandari",
    company: "PT Karya Boga Lestari",
    expiryDate: getRelativeDateValue(210),
    issuedDate: getRelativeDateValue(-640),
    standard: "ISO 9001",
    status: "Nonaktif",
    surveillance1: getRelativeDateValue(-420),
    surveillance2: getRelativeDateValue(-120),
  },
  {
    id: "QSI-NON-007",
    auditor: "Arman Hakim",
    company: "PT Mandala Kemasan",
    expiryDate: getRelativeDateValue(120),
    issuedDate: getRelativeDateValue(-580),
    standard: "GMP",
    status: "Nonaktif",
    surveillance1: getRelativeDateValue(-400),
    surveillance2: getRelativeDateValue(-90),
  },
  {
    id: "QSI-NON-008",
    auditor: "Sinta Maharani",
    company: "CV Kopi Bukit Raya",
    expiryDate: getRelativeDateValue(95),
    issuedDate: getRelativeDateValue(-700),
    standard: "HACCP",
    status: "Nonaktif",
    surveillance1: getRelativeDateValue(-500),
    surveillance2: getRelativeDateValue(-160),
  },
  {
    id: "QSI-NON-009",
    auditor: "Tegar Nugroho",
    company: "PT Pangan Jaya Abadi",
    expiryDate: getRelativeDateValue(45),
    issuedDate: getRelativeDateValue(-800),
    standard: "ISO 22000:2018",
    status: "Nonaktif",
    surveillance1: getRelativeDateValue(-560),
    surveillance2: getRelativeDateValue(-220),
  },
  {
    id: "QSI-EXP-010",
    auditor: "Yudi Defitra",
    company: "PT Bumi Agro Sentosa",
    expiryDate: getRelativeDateValue(-1),
    issuedDate: getRelativeDateValue(-900),
    standard: "ISO 9001",
    status: "Kadaluarsa",
    surveillance1: getRelativeDateValue(-640),
    surveillance2: getRelativeDateValue(-300),
  },
  {
    id: "QSI-EXP-011",
    auditor: "Dewi Anggraini",
    company: "CV Manis Jaya Bakery",
    expiryDate: getRelativeDateValue(-1),
    issuedDate: getRelativeDateValue(-820),
    standard: "HACCP",
    status: "Kadaluarsa",
    surveillance1: getRelativeDateValue(-620),
    surveillance2: getRelativeDateValue(-280),
  },
  {
    id: "QSI-EXP-012",
    auditor: "Rizky Pratama",
    company: "PT Segar Dingin Logistik",
    expiryDate: getRelativeDateValue(-1),
    issuedDate: getRelativeDateValue(-760),
    standard: "ISO 22000",
    status: "Kadaluarsa",
    surveillance1: getRelativeDateValue(-540),
    surveillance2: getRelativeDateValue(-210),
  },
  {
    id: "QSI-EXP-013",
    auditor: "Nadia Putri",
    company: "PT Lestari Farmindo",
    expiryDate: getRelativeDateValue(-1),
    issuedDate: getRelativeDateValue(-690),
    standard: "GMP",
    status: "Kadaluarsa",
    surveillance1: getRelativeDateValue(-480),
    surveillance2: getRelativeDateValue(-180),
  },
  {
    id: "QSI-EXP-014",
    auditor: "Bima Satria",
    company: "CV Maju Roti Indonesia",
    expiryDate: getRelativeDateValue(-1),
    issuedDate: getRelativeDateValue(-610),
    standard: "ISO 22000:2018",
    status: "Kadaluarsa",
    surveillance1: getRelativeDateValue(-390),
    surveillance2: getRelativeDateValue(-150),
  },
];

export const sidebarItems: SidebarItem[] = [
  { label: "Dasbor", icon: LayoutDashboard, href: "/" },
  { label: "Sertifikat", icon: BadgeCheck, href: "/certificate" },
  { label: "Keluar", icon: LogOut, href: "/api/auth/logout", isExternal: true },
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
      title: "Total Sertifikat",
      value: sourceCertificates.length,
      description: "Semua data sertifikat",
      icon: FileText,
      iconClassName: "bg-sky-50 text-sky-600",
    },
    {
      title: "Sertifikat Aktif",
      value: sourceCertificates.filter((item) => item.status === "Aktif")
        .length,
      description: "Sertifikat yang masih berlaku",
      icon: ShieldCheck,
      iconClassName: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Sertifikat Nonaktif",
      value: sourceCertificates.filter((item) => item.status === "Nonaktif")
        .length,
      description: "Sertifikat yang sedang tidak aktif",
      icon: XCircle,
      iconClassName: "bg-slate-100 text-slate-600",
    },
  ];
}

function getRelativeDateValue(dayOffset: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + dayOffset);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
