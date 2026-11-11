import Link from "next/link";
import { Menu, LayoutDashboard, LogOut, User as UserIcon } from "lucide-react";
import { auth, signOut } from "@/auth";
import { Logo } from "@/components/site/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";

import { getCmsNavItems } from "@/lib/cms-loader";

const NAV_LINKS: Array<{ href: string; label: string; isExternal?: boolean }> = [
  { href: "/what-we-do", label: "What we Do" },
  { href: "/sponsor-a-child", label: "Sponsor a Child" },
  { href: "/become-a-brightener", label: "Become a Brightener" },
  { href: "/donate", label: "Make a Donation" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

export async function SiteHeader() {
  const [session, cmsNavItems] = await Promise.all([
    auth(),
    getCmsNavItems("HEADER"),
  ]);
  const user = session?.user;
  const isStaff = user?.role === "ADMIN" || user?.role === "STAFF";

  const navLinks =
    cmsNavItems.length > 0
      ? cmsNavItems.map((i) => ({ href: i.href, label: i.label, isExternal: i.isExternal }))
      : NAV_LINKS;

  return (
    <header className="sticky top-0 z-50 bg-background pt-2.5 pb-1 px-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl bg-brand-navy px-5 py-3 text-white shadow-md shadow-brand-navy/10 sm:px-7">
        <Logo light size="md" className="shrink-0" />

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.isExternal ? "_blank" : undefined}
              rel={link.isExternal ? "noopener noreferrer" : undefined}
              className="text-[15px] font-medium text-white/85 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle className="text-white/85 hover:bg-white/10 hover:text-white" />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full py-1.5 pr-4 pl-1 transition-colors hover:bg-white/10">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
                  <AvatarFallback className="text-foreground text-xs">
                    {(user.name ?? user.email ?? "U").slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.name?.split(" ")[0] ?? "Account"}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                {isStaff && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <LayoutDashboard className="size-4" />
                      Admin dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/account">
                    <UserIcon className="size-4" />
                    My account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild variant="destructive">
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/" });
                    }}
                    className="w-full"
                  >
                    <button type="submit" className="flex w-full items-center gap-2">
                      <LogOut className="size-4" />
                      Sign out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                asChild
                variant="secondary"
                className="h-10 rounded-full bg-white px-5.5 text-[15px] text-brand-navy hover:bg-white/90"
              >
                <Link href="/login">Log In</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-10 rounded-full border-white/40 bg-transparent px-5.5 text-[15px] text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/signup">Join</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-white hover:bg-white/10 lg:hidden")}
          >
            <Menu className="size-5" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                <Logo />
                <ThemeToggle className="text-foreground hover:bg-muted" />
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.isExternal ? "_blank" : undefined}
                  rel={link.isExternal ? "noopener noreferrer" : undefined}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2 px-4">
              {user ? (
                <>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/account">My account</Link>
                  </Button>
                  {isStaff && (
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/admin">Admin dashboard</Link>
                    </Button>
                  )}
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/" });
                    }}
                  >
                    <Button type="submit" variant="ghost" className="w-full">
                      Sign out
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button asChild variant="outline">
                    <Link href="/login">Log In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Join</Link>
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
