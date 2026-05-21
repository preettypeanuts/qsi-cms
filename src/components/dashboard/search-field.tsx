"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchFieldProps = {
  className?: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  value: string;
};

export function SearchField({
  className,
  onSearch,
  placeholder = "Cari...",
  value,
}: SearchFieldProps) {
  const [draftValue, setDraftValue] = useState(value);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  return (
    <form
      className={cn("relative w-full", className)}
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(draftValue);
      }}
    >
      <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-slate-400" />
      <Input
        className="pr-24 pl-9"
        placeholder={placeholder}
        value={draftValue}
        onChange={(event) => setDraftValue(event.target.value)}
      />
      <Button
        type="submit"
        size="sm"
        variant="outline"
        className="-translate-y-1/2 absolute top-1/2 right-1 h-8 rounded-lg px-3"
      >
        <Search className="size-3.5" />
        Cari
      </Button>
    </form>
  );
}
