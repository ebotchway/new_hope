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
  ExternalLink,
} from "lucide-react";
import { requireStaff } from "@/lib/session";
import { Logo } from "@/components/site/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NAV_SECTIONS = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
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
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-white lg:flex">
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
        <header className="flex items-center justify-between border-b bg-white px-6 py-3 lg:justify-end">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="flex items-center gap-2">
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
