"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Users2,
  FileText,
  BookHeart,
  History,
  Contact,
  HandCoins,
  Mail,
  UserCog,
  Settings,
  Archive,
  ShieldCheck,
  Sparkles,
  Navigation,
  Image as ImageIcon,
  Palette,
  Search,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/reports", label: "Reports & Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Programs & Beneficiaries",
    items: [
      { href: "/admin/children", label: "Children Profiles", icon: Users2 },
      { href: "/admin/progress-reports", label: "Progress Reports", icon: FileText },
      { href: "/admin/stories", label: "Impact Stories", icon: BookHeart },
      { href: "/admin/impact-stats", label: "Impact Statistics", icon: BarChart3 },
      { href: "/admin/history", label: "Milestones & History", icon: History },
      { href: "/admin/trustees", label: "Board & Trustees", icon: Contact },
    ],
  },
  {
    title: "Fundraising & Community",
    items: [
      { href: "/admin/donations", label: "Donation Ledger", icon: HandCoins },
      { href: "/admin/inquiries", label: "Inquiries & Brighteners", icon: Mail },
    ],
  },
  {
    title: "Website & Content",
    items: [
      { href: "/admin/website/pages", label: "Pages & Revisions", icon: FileText },
      { href: "/admin/website/homepage", label: "Homepage Builder", icon: Sparkles },
      { href: "/admin/website/navigation", label: "Navigation Menus", icon: Navigation },
      { href: "/admin/website/media", label: "Media Library", icon: ImageIcon },
      { href: "/admin/website/appearance", label: "Appearance & Branding", icon: Palette },
      { href: "/admin/website/seo", label: "SEO & Social", icon: Search },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/admin/users", label: "User Accounts", icon: UserCog },
      { href: "/admin/settings", label: "Site & Payments", icon: Settings },
      { href: "/admin/settings/backups", label: "Backups & Restore", icon: Archive },
      { href: "/admin/reports/audit-logs", label: "Audit Logs", icon: ShieldCheck },
    ],
  },
];

// Flatten all items for accurate longest-prefix route matching
const ALL_HREFS = ADMIN_NAV_SECTIONS.flatMap((s) => s.items.map((i) => i.href));

export function isRouteActive(currentPath: string, itemHref: string): boolean {
  if (itemHref === "/admin") {
    return currentPath === "/admin";
  }

  if (currentPath === itemHref) {
    return true;
  }

  // If path starts with itemHref + "/", check whether a longer href exists in the menu that matches better
  if (currentPath.startsWith(itemHref + "/")) {
    const longerMatchingHref = ALL_HREFS.find(
      (other) =>
        other.length > itemHref.length &&
        (currentPath === other || currentPath.startsWith(other + "/"))
    );
    return !longerMatchingHref;
  }

  return false;
}

interface SidebarNavProps {
  onNavigate?: () => void;
  className?: string;
}

export function SidebarNav({ onNavigate, className }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("space-y-6", className)}>
      {ADMIN_NAV_SECTIONS.map((section) => (
        <div key={section.title}>
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
            {section.title}
          </p>
          <div className="mt-2 space-y-1">
            {section.items.map((item) => {
              const active = isRouteActive(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-brand-navy text-white shadow-xs font-semibold dark:bg-brand-gold/15 dark:text-brand-gold dark:border dark:border-brand-gold/30"
                      : "text-foreground/75 hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-colors",
                        active
                          ? "text-brand-gold dark:text-brand-gold"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {active && (
                    <span className="size-1.5 rounded-full bg-brand-gold shrink-0 ml-2" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function ViewSiteLink({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 px-5 py-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border-t",
        className
      )}
    >
      <ExternalLink className="size-4" />
      <span>View Live Website</span>
    </Link>
  );
}
