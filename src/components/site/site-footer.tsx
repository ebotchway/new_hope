import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { prisma } from "@/lib/prisma";

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 2H22l-7.6 8.7L23 22h-6.9l-5.4-6.6L4.5 22H1.4l8.1-9.3L1 2h7l4.9 6.1L18.9 2Zm-1.2 18h1.7L7.4 3.9H5.6L17.7 20Z" />
    </svg>
  );
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.5V8.5l6.3 3.5-6.3 3.5Z" />
    </svg>
  );
}

const NAV_LINKS = [
  { href: "/what-we-do", label: "What we Do" },
  { href: "/sponsor-a-child", label: "Sponsor a Child" },
  { href: "/become-a-brightener", label: "Become a Brightener" },
  { href: "/donate", label: "Make a Donation" },
  { href: "/about", label: "About Us" },
];

export async function SiteFooter() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } }).catch(() => null);

  const socials = [
    { href: settings?.facebookUrl, icon: FacebookIcon, label: "Facebook" },
    { href: settings?.twitterUrl, icon: XIcon, label: "Twitter" },
    { href: settings?.youtubeUrl, icon: YoutubeIcon, label: "YouTube" },
  ].filter((s) => s.href);

  return (
    <footer className="mt-28 bg-brand-navy text-white">
      <div className="mx-auto max-w-7xl px-6 py-18">
        <div className="flex flex-col items-center gap-7 text-center">
          <Logo light tagline size="lg" />

          <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-white/80 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {socials.length > 0 && (
            <div className="flex items-center gap-3">
              {socials.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href!}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-7 text-xs text-white/60 sm:flex-row">
          <p>Copyright © {new Date().getFullYear()} LivingHope. All Rights Reserved</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
