import { X } from "lucide-react";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";

type MobileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm md:hidden">
      <div className="h-full w-72 bg-white p-4 shadow-xl">
        <div className="mb-4 flex justify-end">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>
        <DashboardSidebar />
      </div>
    </div>
  );
}
