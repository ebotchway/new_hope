import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export type Crumb = { label: string; href?: string };

const DEFAULT_ROOT: Crumb = { label: "Home", href: "/" };

/**
 * Renders a breadcrumb trail (prefixed with `root`, "Home" by default — pass a different
 * root for a section with its own top, e.g. the admin dashboard) plus matching
 * BreadcrumbList JSON-LD for search engines. The last item is always shown as the current
 * page, even if it's given an href.
 */
export function Breadcrumbs({
  items,
  className,
  root = DEFAULT_ROOT,
}: {
  items: Crumb[];
  className?: string;
  root?: Crumb;
}) {
  const trail: Crumb[] = [root, ...items];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: new URL(item.href, appUrl).toString() } : {}),
    })),
  };

  return (
    <div className={className}>
      <Breadcrumb>
        <BreadcrumbList>
          {trail.map((item, i) => {
            const isLast = i === trail.length - 1;
            return (
              <BreadcrumbGroup key={`${item.label}-${i}`} isLast={isLast} item={item} />
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}

function BreadcrumbGroup({ item, isLast }: { item: Crumb; isLast: boolean }) {
  return (
    <>
      <BreadcrumbItem>
        {isLast || !item.href ? (
          <BreadcrumbPage>{item.label}</BreadcrumbPage>
        ) : (
          <BreadcrumbLink render={<Link href={item.href}>{item.label}</Link>} />
        )}
      </BreadcrumbItem>
      {!isLast && <BreadcrumbSeparator />}
    </>
  );
}
