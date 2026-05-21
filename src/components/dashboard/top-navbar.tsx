import { Menu } from "lucide-react";

import { NotificationBell } from "@/components/dashboard/notification-bell";
import { SearchField } from "@/components/dashboard/search-field";
import { Button } from "@/components/ui/button";

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
          <SearchField
            className="sm:w-96"
            placeholder={searchPlaceholder}
            value={query}
            onSearch={(value) => onQueryChange?.(value)}
          />
        ) : null}
        <NotificationBell />
      </div>
    </header>
  );
}
