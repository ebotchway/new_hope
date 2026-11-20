"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarNav, ViewSiteLink } from "@/components/admin/sidebar-nav";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "lg:hidden text-foreground/80 hover:bg-secondary"
        )}
        aria-label="Open Navigation Menu"
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 flex flex-col justify-between">
        <div className="flex flex-col flex-1 overflow-hidden">
          <SheetHeader className="p-5 border-b shrink-0 text-left">
            <SheetTitle>
              <Logo />
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <SidebarNav onNavigate={() => setOpen(false)} />
          </div>
        </div>
        <ViewSiteLink className="shrink-0 bg-background" />
      </SheetContent>
    </Sheet>
  );
}
