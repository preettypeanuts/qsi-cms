"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, InfoIcon, Loader2, RotateCcw, Save } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getTomorrowDateValue,
  getYesterdayDateValue,
  isAfterTodayDateValue,
  isYesterdayDateValue,
} from "@/lib/certificate-date-rules";
import type { CertificatePayload } from "@/lib/certificates";
import { cn } from "@/lib/utils";

const statusOptions = ["Aktif", "Nonaktif", "Kadaluarsa"] as const;
const certificateTypes = [
  "ISO 9001",
  "ISO 22000",
  "ISO 22000:2018",
  "HACCP",
  "GMP",
] as const;
const customCertificateTypeValue = "__custom_certificate_type__";
const inputDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const manualDatePattern = /^\d{2}\/\d{2}\/\d{4}$/;
const dateValueSchema = (fieldName: string) =>
  z
    .string()
    .min(1, `${fieldName} wajib diisi.`)
    .refine(isValidDateValue, `${fieldName} harus format DD/MM/YYYY.`);
const certificateRules = [
  "Nama klien minimal 3 karakter. Misalnya: PT Pawon Sae Nusantara.",
  "Nomor sertifikat wajib diisi sesuai dokumen yang diterbitkan.",
  "Jika jenis sertifikasi belum ada di daftar, pilih Tambah jenis baru lalu isi namanya.",
  "Semua tanggal bisa diketik manual dengan format DD/MM/YYYY atau dipilih dari date picker.",
  "Urutan tanggal harus jelas: Tanggal Terbit, Surveillance 1, Surveillance 2, lalu Tanggal Kadaluarsa.",
  "Jika status Kadaluarsa, Tanggal Kadaluarsa otomatis memakai tanggal kemarin.",
  "Jika status Aktif, Tanggal Kadaluarsa harus besok atau setelahnya.",
  "Status pilih sesuai kondisi sertifikat: Aktif, Nonaktif, atau Kadaluarsa. Nama auditor boleh dikosongkan.",
];

const certificateFormSchema = z
  .object({
    companyName: z.string().trim().min(3, "Nama Klien minimal 3 karakter."),
    certificateType: z.string().min(1, "Jenis sertifikasi wajib dipilih."),
    certificateNumber: z
      .string()
      .trim()
      .min(1, "Nomor sertifikat wajib diisi."),
    issueDate: dateValueSchema("Tanggal Terbit"),
    expiryDate: dateValueSchema("Tanggal Kadaluarsa"),
    surveillance1: dateValueSchema("Surveillance 1"),
    surveillance2: dateValueSchema("Surveillance 2"),
    status: z.enum(statusOptions, {
      error: "Status wajib dipilih.",
    }),
    auditorName: z.string().trim(),
  })
  .refine(
    (value) => {
      if (!value.issueDate || !value.surveillance1) {
        return true;
      }

      return isDateAfter(value.surveillance1, value.issueDate);
    },
    {
      message: "Surveillance 1 harus setelah Tanggal Terbit.",
      path: ["surveillance1"],
    },
  )
  .refine(
    (value) => {
      if (!value.surveillance1 || !value.surveillance2) {
        return true;
      }

      return isDateAfter(value.surveillance2, value.surveillance1);
    },
    {
      message: "Surveillance 2 harus setelah Surveillance 1.",
      path: ["surveillance2"],
    },
  )
  .refine(
    (value) => {
      if (!value.surveillance2 || !value.expiryDate) {
        return true;
      }

      return isDateAfter(value.expiryDate, value.surveillance2);
    },
    {
      message: "Tanggal Kadaluarsa harus setelah Surveillance 2.",
      path: ["expiryDate"],
    },
  )
  .refine(
    (value) =>
      value.status !== "Kadaluarsa" || isYesterdayDateValue(value.expiryDate),
    {
      message:
        "Jika status Kadaluarsa, Tanggal Kadaluarsa harus tanggal kemarin.",
      path: ["expiryDate"],
    },
  )
  .refine(
    (value) =>
      value.status !== "Aktif" || isAfterTodayDateValue(value.expiryDate),
    {
      message:
        "Jika status Aktif, Tanggal Kadaluarsa harus besok atau setelahnya.",
      path: ["expiryDate"],
    },
  );

export type CertificateFormValues = z.infer<typeof certificateFormSchema>;

export function mapFormValuesToCertificatePayload(
  values: CertificateFormValues,
): CertificatePayload {
  return {
    auditor: values.auditorName.trim(),
    company: values.companyName,
    expiryDate: toApiDateValue(values.expiryDate),
    id: values.certificateNumber,
    issuedDate: toApiDateValue(values.issueDate),
    standard: values.certificateType,
    status: values.status,
    surveillance1: toApiDateValue(values.surveillance1),
    surveillance2: toApiDateValue(values.surveillance2),
  };
}

const defaultValues: CertificateFormValues = {
  companyName: "",
  certificateType: "",
  certificateNumber: "",
  issueDate: "",
  expiryDate: "",
  surveillance1: "",
  surveillance2: "",
  status: "Aktif",
  auditorName: "",
};

type CertificateFormProps = {
  className?: string;
  mode?: "add" | "edit";
  initialValues?: Partial<CertificateFormValues>;
  onCancel?: () => void;
  onSave?: (values: CertificateFormValues) => Promise<void> | void;
};

export function CertificateForm({
  className,
  mode = "add",
  initialValues,
  onCancel,
  onSave,
}: CertificateFormProps) {
  const form = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateFormSchema),
    defaultValues: {
      ...defaultValues,
      ...initialValues,
    },
  });
  const statusValue = form.watch("status");
  const certificateTypeValue = form.watch("certificateType");
  const [isCustomCertificateType, setIsCustomCertificateType] = useState(false);

  useEffect(() => {
    const expiryDate = form.getValues("expiryDate");

    if (statusValue === "Kadaluarsa") {
      const yesterday = getYesterdayDateValue();

      if (expiryDate !== yesterday) {
        form.setValue("expiryDate", yesterday, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    }

    if (statusValue === "Aktif" && !isAfterTodayDateValue(expiryDate)) {
      form.setValue("expiryDate", getTomorrowDateValue(), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [form, statusValue]);

  useEffect(() => {
    if (certificateTypeValue && !isKnownCertificateType(certificateTypeValue)) {
      setIsCustomCertificateType(true);
    }
  }, [certificateTypeValue]);

  async function handleSubmit(values: CertificateFormValues) {
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    await onSave?.(values);
  }

  function handleCancel() {
    form.reset({
      ...defaultValues,
      ...initialValues,
    });
    onCancel?.();
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row gap-2 items-center justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle>
            {mode === "edit" ? "Ubah Sertifikat" : "Tambah Sertifikat Baru"}
          </CardTitle>
          <CardDescription>
            Lengkapi data sertifikat sesuai informasi pada dokumen klien.
          </CardDescription>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="mb-5 rounded-2xl border border-sky-100 bg-sky-50/70 px-2 py-1 flex items-center gap-1 cursor-pointer hover:shadow-md"
              tabIndex={0}
              aria-label="Lihat panduan pengisian sertifikat"
            >
              <span className="font-semibold text-sky-900 text-sm">
                Panduan isi data{" "}
              </span>
              <span className="text-xs text-sky-800">
                <InfoIcon className="size-5" />
              </span>
            </button>
          </PopoverTrigger>

          <PopoverContent align="start" className="w-[320px] p-4">
            <ul className="space-y-2 text-sky-800 text-sm">
              {certificateRules.map((rule) => (
                <li key={rule} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sky-500" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              description="Gunakan nama resmi perusahaan."
              error={form.formState.errors.companyName?.message}
              id="companyName"
              label="Nama Klien"
            >
              <Input
                id="companyName"
                placeholder="PT Pawon Sae Nusantara"
                {...form.register("companyName")}
              />
            </FormField>

            <FormField
              description="Pilih dari daftar, atau tambah jenis baru jika belum tersedia."
              error={form.formState.errors.certificateType?.message}
              id="certificateType"
              label="Jenis Sertifikasi"
            >
              <Controller
                control={form.control}
                name="certificateType"
                render={({ field }) => {
                  const selectedValue = isCustomCertificateType
                    ? customCertificateTypeValue
                    : getSelectedCertificateTypeValue(field.value);

                  return (
                    <div className="space-y-2">
                      <Select
                        value={selectedValue}
                        onValueChange={(value) => {
                          const isCustomValue =
                            value === customCertificateTypeValue;

                          setIsCustomCertificateType(isCustomValue);
                          field.onChange(isCustomValue ? "" : value);
                        }}
                      >
                        <SelectTrigger id="certificateType">
                          <SelectValue placeholder="Pilih jenis sertifikasi" />
                        </SelectTrigger>
                        <SelectContent>
                          {certificateTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                          <SelectItem value={customCertificateTypeValue}>
                            Tambah jenis baru
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {isCustomCertificateType ? (
                        <Input
                          id="certificateTypeCustom"
                          placeholder="Tulis jenis sertifikasi baru"
                          value={field.value}
                          onChange={(event) =>
                            field.onChange(event.target.value)
                          }
                        />
                      ) : null}
                    </div>
                  );
                }}
              />
            </FormField>

            <FormField
              description="Isi sesuai nomor yang tertera pada dokumen sertifikat."
              error={form.formState.errors.certificateNumber?.message}
              id="certificateNumber"
              label="Nomor Sertifikat"
            >
              <Input
                id="certificateNumber"
                placeholder="202508001001HCK007"
                {...form.register("certificateNumber")}
              />
            </FormField>

            <FormField
              description="Bisa diketik manual format DD/MM/YYYY. Misalnya: 28/08/2025."
              error={form.formState.errors.issueDate?.message}
              id="issueDate"
              label="Tanggal Terbit"
            >
              <Controller
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <DatePickerField
                    id="issueDate"
                    placeholder="DD/MM/YYYY"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>

            <FormField
              description={getExpiryDateDescription(statusValue)}
              error={form.formState.errors.expiryDate?.message}
              id="expiryDate"
              label="Tanggal Kadaluarsa"
            >
              <Controller
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <DatePickerField
                    id="expiryDate"
                    placeholder="DD/MM/YYYY"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>

            <FormField
              description="Harus setelah Tanggal Terbit. Bisa diketik manual format DD/MM/YYYY."
              error={form.formState.errors.surveillance1?.message}
              id="surveillance1"
              label="Surveillance 1"
            >
              <Controller
                control={form.control}
                name="surveillance1"
                render={({ field }) => (
                  <DatePickerField
                    id="surveillance1"
                    placeholder="DD/MM/YYYY"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>

            <FormField
              description="Harus setelah Surveillance 1. Bisa diketik manual format DD/MM/YYYY."
              error={form.formState.errors.surveillance2?.message}
              id="surveillance2"
              label="Surveillance 2"
            >
              <Controller
                control={form.control}
                name="surveillance2"
                render={({ field }) => (
                  <DatePickerField
                    id="surveillance2"
                    placeholder="DD/MM/YYYY"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>

            <FormField
              description="Gunakan status sesuai kondisi sertifikat saat ini."
              error={form.formState.errors.status?.message}
              id="status"
              label="Status"
            >
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField
              description="Opsional. Boleh dikosongkan jika auditor belum ditentukan."
              error={form.formState.errors.auditorName?.message}
              id="auditorName"
              label="Auditor"
            >
              <Input
                id="auditorName"
                placeholder="Yudi Defitra"
                {...form.register("auditorName")}
              />
            </FormField>
          </div>

          <div className="flex flex-col-reverse gap-3 border-slate-100 border-t pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <RotateCcw className="size-4" />
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isSubmitting ? "Menyimpan..." : "Simpan Sertifikat"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function DatePickerField({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = parseDateValue(value) ?? undefined;

  return (
    <div className="relative">
      <Input
        id={id}
        className="pr-11"
        inputMode="numeric"
        placeholder={placeholder}
        value={formatDateForDisplay(value)}
        onChange={(event) => onChange(event.target.value)}
      />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="-translate-y-1/2 absolute top-1/2 right-1"
            aria-label="Pilih tanggal"
          >
            <CalendarIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              onChange(date ? format(date, "dd/MM/yyyy") : "");
              setIsOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function getExpiryDateDescription(status: CertificateFormValues["status"]) {
  if (status === "Kadaluarsa") {
    return `Untuk status Kadaluarsa, tanggal ini otomatis menjadi tanggal kemarin (${formatDateForDisplay(getYesterdayDateValue())}).`;
  }

  if (status === "Aktif") {
    return `Untuk status Aktif, pilih tanggal besok atau setelahnya. Paling cepat ${formatDateForDisplay(getTomorrowDateValue())}.`;
  }

  return "Untuk status Nonaktif, pastikan tanggal tetap sesuai dokumen sertifikat.";
}

function isValidDateValue(value: string) {
  return Boolean(parseDateValue(value));
}

function isDateAfter(left: string, right: string) {
  const leftDate = parseDateValue(left);
  const rightDate = parseDateValue(right);

  if (!leftDate || !rightDate) {
    return true;
  }

  return leftDate > rightDate;
}

function parseDateValue(value: string) {
  const trimmedValue = value.trim();

  if (inputDatePattern.test(trimmedValue)) {
    const [year, month, day] = trimmedValue.split("-").map(Number);

    return parseDateParts(year, month, day);
  }

  if (manualDatePattern.test(trimmedValue)) {
    const [day, month, year] = trimmedValue.split("/").map(Number);

    return parseDateParts(year, month, day);
  }

  return null;
}

function parseDateParts(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function toApiDateValue(value: string) {
  const date = parseDateValue(value);

  if (!date) {
    return value;
  }

  return format(date, "yyyy-MM-dd");
}

function formatDateForDisplay(value: string) {
  const date = parseDateValue(value);

  if (!date) {
    return value;
  }

  return format(date, "dd/MM/yyyy");
}

function getSelectedCertificateTypeValue(value: string) {
  if (!value) {
    return "";
  }

  return isKnownCertificateType(value) ? value : customCertificateTypeValue;
}

function isKnownCertificateType(value: string) {
  return certificateTypes.some((type) => type === value);
}

function FormField({
  id,
  label,
  description,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  description?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={id} className={cn("block space-y-2", className)}>
      <span className="font-medium text-slate-700 text-sm">{label}</span>
      {children}
      {description ? (
        <p className="text-slate-500 text-xs leading-relaxed">{description}</p>
      ) : null}
      {error ? <p className="text-red-600 text-sm">{error}</p> : null}
    </label>
  );
}
