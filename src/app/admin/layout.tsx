import { requireStaff } from "@/lib/session";
import { Logo } from "@/components/site/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarNav, ViewSiteLink } from "@/components/admin/sidebar-nav";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-background lg:flex">
        <div className="p-5">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-6">
          <SidebarNav />
        </div>
        <ViewSiteLink />
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-background px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <AdminMobileNav />
            <Logo />
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <ThemeToggle className="text-muted-foreground hover:bg-secondary hover:text-foreground" />
            <Avatar className="size-8">
              <AvatarFallback className="bg-brand-navy text-xs text-white">
                {(session.user.name ?? session.user.email ?? "U").slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm hidden sm:block">
              <p className="font-medium leading-none">{session.user.name}</p>
              <p className="text-xs text-muted-foreground">{session.user.role}</p>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
