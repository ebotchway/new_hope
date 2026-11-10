import Link from "next/link";
import {
  LayoutDashboard,
  Users2,
  BookHeart,
  BarChart3,
  History,
  Contact,
  HandCoins,
  Mail,
  UserCog,
  Settings,
  Globe,
  Sparkles,
  FileText,
  Navigation,
  Image as ImageIcon,
  Palette,
  Search,
  RefreshCw,
  HeartHandshake,
  GraduationCap,
  Smartphone,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { requireStaff } from "@/lib/session";
import { Logo } from "@/components/site/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_SECTIONS = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Reports & Analytics",
    items: [
      { href: "/admin/reports", label: "Overview", icon: BarChart3 },
      { href: "/admin/reports/financial", label: "Financial Reports", icon: HandCoins },
      { href: "/admin/reports/donations", label: "Donation Ledger", icon: FileText },
      { href: "/admin/reports/recurring", label: "Recurring Giving", icon: RefreshCw },
      { href: "/admin/reports/sponsorships", label: "Sponsorships", icon: HeartHandshake },
      { href: "/admin/reports/donors", label: "Donors & Retention", icon: Users2 },
      { href: "/admin/reports/children", label: "Beneficiaries", icon: GraduationCap },
      { href: "/admin/reports/momo", label: "MoMo Reconciliation", icon: Smartphone },
      { href: "/admin/reports/reconciliation", label: "Payment Audit", icon: ShieldCheck },
      { href: "/admin/reports/inquiries", label: "Inquiries", icon: Mail },
      { href: "/admin/reports/website", label: "Content Reports", icon: Globe },
      { href: "/admin/reports/audit-logs", label: "Audit Logs", icon: History },
    ],
  },
  {
    title: "Website Management",
    items: [
      { href: "/admin/website", label: "Overview", icon: Globe },
      { href: "/admin/website/homepage", label: "Homepage Builder", icon: Sparkles },
      { href: "/admin/website/pages", label: "Pages", icon: FileText },
      { href: "/admin/website/navigation", label: "Navigation & Menus", icon: Navigation },
      { href: "/admin/website/media", label: "Media Library", icon: ImageIcon },
      { href: "/admin/website/appearance", label: "Appearance & Branding", icon: Palette },
      { href: "/admin/website/seo", label: "SEO & Social", icon: Search },
    ],
  },
  {
    title: "Programs",
    items: [
      { href: "/admin/children", label: "Children", icon: Users2 },
      { href: "/admin/stories", label: "Stories", icon: BookHeart },
      { href: "/admin/impact-stats", label: "Impact Stats", icon: BarChart3 },
      { href: "/admin/history", label: "History", icon: History },
      { href: "/admin/trustees", label: "Trustees", icon: Contact },
    ],
  },
  {
    title: "Fundraising",
    items: [
      { href: "/admin/donations", label: "Donations", icon: HandCoins },
      { href: "/admin/inquiries", label: "Inquiries", icon: Mail },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/admin/users", label: "Users", icon: UserCog },
      { href: "/admin/settings", label: "Site Settings", icon: Settings },
    ],
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-background lg:flex">
        <div className="p-5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {section.title}
              </p>
              <div className="mt-2 space-y-0.5">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-foreground"
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <Link
          href="/"
          className="flex items-center gap-2 border-t px-5 py-4 text-sm text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="size-4" />
          View site
        </Link>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-background px-6 py-3 lg:justify-end">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle className="text-muted-foreground hover:bg-secondary hover:text-foreground" />
            <Avatar className="size-8">
              <AvatarFallback className="bg-brand-navy text-xs text-white">
                {(session.user.name ?? session.user.email ?? "U").slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium leading-none">{session.user.name}</p>
              <p className="text-xs text-muted-foreground">{session.user.role}</p>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
