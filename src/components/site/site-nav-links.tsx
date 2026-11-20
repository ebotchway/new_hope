"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SiteNavLinkItem {
  href: string;
  label: string;
  isExternal?: boolean;
}

interface SiteNavLinksProps {
  links: SiteNavLinkItem[];
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
  className?: string;
}

export function SiteNavLinks({
  links,
  variant = "desktop",
  onNavigate,
  className,
}: SiteNavLinksProps) {
  const pathname = usePathname();

  function isLinkActive(href: string): boolean {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(href + "/");
  }

  if (variant === "mobile") {
    return (
      <nav className={cn("flex flex-col gap-1", className)}>
        {links.map((link) => {
          const active = !link.isExternal && isLinkActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              target={link.isExternal ? "_blank" : undefined}
              rel={link.isExternal ? "noopener noreferrer" : undefined}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors flex items-center justify-between",
                active
                  ? "bg-brand-navy text-white font-semibold dark:bg-brand-gold/15 dark:text-brand-gold shadow-xs"
                  : "text-foreground/80 hover:bg-muted hover:text-foreground"
              )}
            >
              <span>{link.label}</span>
              {active && <span className="size-1.5 rounded-full bg-brand-gold shrink-0" />}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className={cn("flex items-center gap-6", className)}>
      {links.map((link) => {
        const active = !link.isExternal && isLinkActive(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            target={link.isExternal ? "_blank" : undefined}
            rel={link.isExternal ? "noopener noreferrer" : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "text-[15px] transition-all duration-150 py-1 relative",
              active
                ? "font-semibold text-white after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2.5px] after:bg-brand-gold after:rounded-full"
                : "font-medium text-white/80 hover:text-white"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
