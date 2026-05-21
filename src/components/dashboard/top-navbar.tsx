import { Bell, Menu, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TopNavbarProps = {
  onOpenMobileMenu: () => void;
  onQueryChange?: (value: string) => void;
  query?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  subtitle?: string;
  title?: string;
};

export function TopNavbar({
  onOpenMobileMenu,
  onQueryChange,
  query = "",
  searchPlaceholder = "Search certificates...",
  showSearch = true,
  subtitle = "Certification CMS",
  title = "Dashboard",
}: TopNavbarProps) {
  return (
    <header className="flex flex-col gap-4 border-slate-200 border-b bg-white/80 px-4 py-4 backdrop-blur sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onOpenMobileMenu}
        >
          <Menu className="size-5" />
          <span className="sr-only">Open menu</span>
        </Button>
        <div>
          <p className="text-slate-500 text-sm">{subtitle}</p>
          <h1 className="font-semibold text-2xl tracking-tight">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {showSearch ? (
          <div className="relative w-full sm:w-80">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-slate-400" />
            <Input
              className="pl-9"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(event) => onQueryChange?.(event.target.value)}
            />
          </div>
        ) : null}
        <Button variant="outline" size="icon" className="shrink-0">
          <Bell className="size-4" />
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  );
}
