"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Loader2, RotateCcw, Save } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
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
import { cn } from "@/lib/utils";

const statusOptions = ["Active", "Inactive", "Expired"] as const;
const certificateTypes = ["ISO 9001", "ISO 22000", "HACCP", "GMP"] as const;

const certificateFormSchema = z
  .object({
    companyName: z
      .string()
      .min(2, "Company name must be at least 2 characters."),
    certificateType: z.string().min(1, "Certificate type is required."),
    certificateNumber: z
      .string()
      .min(3, "Certificate number must be at least 3 characters."),
    issueDate: z.string().min(1, "Issue date is required."),
    expiryDate: z.string().min(1, "Expiry date is required."),
    surveillance1: z.string().min(1, "Surveillance 1 date is required."),
    surveillance2: z.string().min(1, "Surveillance 2 date is required."),
    status: z.enum(statusOptions, {
      error: "Status is required.",
    }),
    auditorName: z
      .string()
      .min(2, "Auditor name must be at least 2 characters."),
  })
  .refine(
    (value) => {
      if (!value.issueDate || !value.expiryDate) {
        return true;
      }

      return new Date(value.expiryDate) > new Date(value.issueDate);
    },
    {
      message: "Expiry date must be after issue date.",
      path: ["expiryDate"],
    },
  )
  .refine(
    (value) => {
      if (!value.issueDate || !value.surveillance1) {
        return true;
      }

      return new Date(value.surveillance1) > new Date(value.issueDate);
    },
    {
      message: "Surveillance 1 must be after issue date.",
      path: ["surveillance1"],
    },
  )
  .refine(
    (value) => {
      if (!value.surveillance1 || !value.surveillance2) {
        return true;
      }

      return new Date(value.surveillance2) > new Date(value.surveillance1);
    },
    {
      message: "Surveillance 2 must be after surveillance 1.",
      path: ["surveillance2"],
    },
  );

type CertificateFormValues = z.infer<typeof certificateFormSchema>;

const defaultValues: CertificateFormValues = {
  companyName: "",
  certificateType: "",
  certificateNumber: "",
  issueDate: "",
  expiryDate: "",
  surveillance1: "",
  surveillance2: "",
  status: "Active",
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
      <CardHeader>
        <CardTitle>
          {mode === "edit" ? "Edit Certificate" : "New Certificate"}
        </CardTitle>
        <CardDescription>
          Isi data sertifikat sesuai field yang tampil di table certificate.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              error={form.formState.errors.companyName?.message}
              id="companyName"
              label="Nama Klien"
            >
              <Input
                id="companyName"
                placeholder="Atlas Manufacturing"
                {...form.register("companyName")}
              />
            </FormField>

            <FormField
              error={form.formState.errors.certificateType?.message}
              id="certificateType"
              label="Jenis Sertifikasi"
            >
              <Controller
                control={form.control}
                name="certificateType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="certificateType">
                      <SelectValue placeholder="Select certificate type" />
                    </SelectTrigger>
                    <SelectContent>
                      {certificateTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField
              error={form.formState.errors.certificateNumber?.message}
              id="certificateNumber"
              label="Nomor Sertifikat"
            >
              <Input
                id="certificateNumber"
                placeholder="QSI-9001-001"
                {...form.register("certificateNumber")}
              />
            </FormField>

            <FormField
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
                    placeholder="Pilih tanggal terbit"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>

            <FormField
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
                    placeholder="Pilih tanggal kadaluarsa"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>

            <FormField
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
                    placeholder="Pilih tanggal surveillance 1"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>

            <FormField
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
                    placeholder="Pilih tanggal surveillance 2"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>

            <FormField
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
                      <SelectValue placeholder="Select status" />
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
              error={form.formState.errors.auditorName?.message}
              id="auditorName"
              label="Auditor"
            >
              <Input
                id="auditorName"
                placeholder="Sarah Wijaya"
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
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isSubmitting ? "Saving..." : "Save Certificate"}
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
  const selectedDate = value ? parseISO(value) : undefined;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "h-10 w-full justify-start rounded-xl border-slate-200 bg-white px-3 text-left font-normal",
            !selectedDate && "text-slate-400",
          )}
        >
          <CalendarIcon className="size-4" />
          {selectedDate ? format(selectedDate, "dd MMM yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            onChange(date ? format(date, "yyyy-MM-dd") : "");
            setIsOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function FormField({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={id} className={cn("block space-y-2", className)}>
      <span className="font-medium text-slate-700 text-sm">{label}</span>
      {children}
      {error ? <p className="text-red-600 text-sm">{error}</p> : null}
    </label>
  );
}
