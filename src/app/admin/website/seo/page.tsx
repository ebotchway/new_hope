import Link from "next/link";
import { CheckCircle2, AlertTriangle, Edit } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "SEO & Social Metadata | LivingHope Admin",
};

export default async function AdminSeoPage() {
  await requireStaff();

  const pages = await prisma.cmsPage.findMany({
    orderBy: { title: "asc" },
  });

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">SEO & Social Metadata</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search engine ranking health, meta tags, and Open Graph social sharing cards.
          </p>
        </div>
      </div>

      {/* SEO Health Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Indexed Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pages.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready for search crawlers</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Custom SEO Descriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {pages.filter((p) => p.seoDescription).length} / {pages.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Configured for rich search snippets</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Graph Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-primary">
              {pages.filter((p) => p.ogImageUrl).length} / {pages.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Custom social preview banners</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-Page SEO Audit Table */}
      <Card className="rounded-2xl border-border/70">
        <CardHeader>
          <CardTitle className="text-lg font-bold font-heading">Page SEO Audit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/70">
                <tr>
                  <th className="py-3 px-4 font-semibold">Page / Slug</th>
                  <th className="py-3 px-4 font-semibold">Meta Title</th>
                  <th className="py-3 px-4 font-semibold">Meta Description</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {pages.map((p) => {
                  const hasTitle = Boolean(p.seoTitle || p.title);
                  const hasDesc = Boolean(p.seoDescription || p.description);

                  return (
                    <tr key={p.id} className="hover:bg-muted/20">
                      <td className="py-3.5 px-4 font-medium">
                        <div>{p.title}</div>
                        <div className="text-xs text-muted-foreground font-mono">/{p.slug}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground max-w-xs truncate">
                        {p.seoTitle || <span className="text-muted-foreground/60 italic">Fallback: {p.title}</span>}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground max-w-sm truncate">
                        {p.seoDescription || (
                          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <AlertTriangle className="size-3" />
                            <span>Missing description</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {hasTitle && hasDesc ? (
                          <Badge className="bg-emerald-600 text-white text-[10px]">
                            <CheckCircle2 className="mr-1 size-2.5" />
                            <span>Optimized</span>
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            Basic
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button asChild size="sm" variant="outline" className="rounded-lg h-7 text-xs">
                          <Link href="/admin/website/pages">
                            <Edit className="mr-1 size-3 text-brand-primary" />
                            <span>Configure</span>
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
