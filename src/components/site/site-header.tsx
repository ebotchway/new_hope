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

const NAV_LINKS = [
  { href: "/what-we-do", label: "What we Do" },
  { href: "/sponsor-a-child", label: "Sponsor a Child" },
  { href: "/become-a-brightener", label: "Become a Brightener" },
  { href: "/donate", label: "Make a Donation" },
  { href: "/about", label: "About Us" },
];

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;
  const isStaff = user?.role === "ADMIN" || user?.role === "STAFF";

  return (
    <header className="sticky top-0 z-50 bg-white pt-4 pb-2 px-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl bg-brand-navy px-4 py-3 text-white sm:px-6">
        <Logo light className="shrink-0" />

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/85 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-white/10 transition-colors">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
                  <AvatarFallback className="text-brand-navy text-xs">
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
              <Button asChild variant="secondary" className="rounded-full bg-white text-brand-navy hover:bg-white/90">
                <Link href="/login">Log In</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
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
              <SheetTitle>
                <Logo />
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2 px-4">
              {user ? (
                <>
                  {isStaff && (
                    <Button asChild variant="outline">
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
