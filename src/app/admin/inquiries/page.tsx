import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/page-header";
import { InquiryStatusSelect } from "@/components/admin/inquiry-status-select";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteInquiry } from "@/actions/admin/inquiries";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { InquiryStatus } from "@/generated/prisma/enums";

export const metadata = { title: "Inquiries & Registrations — LivingHope Admin" };

export default async function AdminInquiriesPage(props: PageProps<"/admin/inquiries">) {
  await requireStaff();

  const searchParams = await props.searchParams;
  const statusParam = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const categoryParam = typeof searchParams.category === "string" ? searchParams.category : undefined;

  const whereClause: Record<string, unknown> = {};
  if (statusParam) whereClause.status = statusParam as InquiryStatus;
  if (categoryParam) whereClause.category = categoryParam;

  const inquiries = await prisma.partnershipInquiry.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  const [totalAll, totalBrighteners, totalGeneral] = await Promise.all([
    prisma.partnershipInquiry.count(),
    prisma.partnershipInquiry.count({ where: { category: "BRIGHTENER_REGISTRATION" } }),
    prisma.partnershipInquiry.count({ where: { category: "GENERAL_INQUIRY" } }),
  ]);

  return (
    <>
      <AdminPageHeader
        title="Inquiries & Submissions"
        description="Review, filter, and respond to Brightener registrations and general contact desk inquiries."
        breadcrumbs={[{ label: "Inquiries" }]}
      />

      {/* Category Filter Tabs */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/inquiries"
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              !categoryParam
                ? "bg-brand-navy text-white shadow-xs"
                : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            All Submissions ({totalAll})
          </Link>
          <Link
            href="/admin/inquiries?category=BRIGHTENER_REGISTRATION"
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              categoryParam === "BRIGHTENER_REGISTRATION"
                ? "bg-brand-navy text-white shadow-xs"
                : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            Brightener Registrations ({totalBrighteners})
          </Link>
          <Link
            href="/admin/inquiries?category=GENERAL_INQUIRY"
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              categoryParam === "GENERAL_INQUIRY"
                ? "bg-brand-navy text-white shadow-xs"
                : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            General Inquiries ({totalGeneral})
          </Link>
        </div>

        {/* Status Pill Filters */}
        <div className="flex flex-wrap gap-1.5">
          {[undefined, "NEW", "CONTACTED", "CLOSED"].map((option) => {
            const queryParams = new URLSearchParams();
            if (categoryParam) queryParams.set("category", categoryParam);
            if (option) queryParams.set("status", option);
            const queryStr = queryParams.toString();
            const href = queryStr ? `/admin/inquiries?${queryStr}` : "/admin/inquiries";

            return (
              <Link
                key={option ?? "ALL"}
                href={href}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                  statusParam === option
                    ? "border-brand-navy bg-brand-navy text-white"
                    : "border-input bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {option ? option.charAt(0) + option.slice(1).toLowerCase() : "All Statuses"}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40">
              <TableHead>Contact</TableHead>
              <TableHead>Category / Type</TableHead>
              <TableHead>Details & Message</TableHead>
              <TableHead>Submitted Date</TableHead>
              <TableHead className="w-36">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inquiry) => {
              const isBrightener = inquiry.category === "BRIGHTENER_REGISTRATION";
              return (
                <TableRow key={inquiry.id} className="hover:bg-muted/40">
                  <TableCell className="align-top">
                    <p className="font-semibold text-foreground">{inquiry.name}</p>
                    <p className="text-xs text-muted-foreground">{inquiry.email}</p>
                    {inquiry.phone && (
                      <p className="text-[11px] text-muted-foreground/80">{inquiry.phone}</p>
                    )}
                    {inquiry.organization && (
                      <p className="mt-1 text-xs font-medium text-brand-navy dark:text-blue-300">
                        Org: {inquiry.organization}
                        {inquiry.role ? ` (${inquiry.role})` : ""}
                      </p>
                    )}
                  </TableCell>

                  <TableCell className="align-top">
                    <div className="space-y-1">
                      <Badge
                        variant={isBrightener ? "default" : "secondary"}
                        className={
                          isBrightener
                            ? "bg-brand-navy/10 text-brand-navy hover:bg-brand-navy/20 border-brand-navy/20 text-[11px]"
                            : "text-[11px]"
                        }
                      >
                        {isBrightener ? "Brightener" : "General Inquiry"}
                      </Badge>
                      <p className="text-xs text-muted-foreground font-medium">
                        {inquiry.type.replace(/_/g, " ")}
                      </p>
                      {inquiry.preferredFrequency && (
                        <p className="text-[11px] text-muted-foreground">
                          Freq: {inquiry.preferredFrequency}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="align-top max-w-md text-xs leading-relaxed text-muted-foreground">
                    {inquiry.subject && (
                      <p className="font-semibold text-foreground text-xs mb-1">
                        Subj: {inquiry.subject}
                      </p>
                    )}
                    {inquiry.skills && (
                      <p className="text-xs text-brand-gold-dark font-medium mb-1">
                        Skills: {inquiry.skills} | Avail: {inquiry.availability || "Flexible"}
                      </p>
                    )}
                    <div className="line-clamp-3 whitespace-pre-wrap">{inquiry.message || "—"}</div>
                  </TableCell>

                  <TableCell className="align-top text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(inquiry.createdAt)}
                  </TableCell>

                  <TableCell className="align-top">
                    <div className="flex items-center gap-1.5">
                      <InquiryStatusSelect id={inquiry.id} status={inquiry.status} />
                      <DeleteButton
                        confirmMessage="Permanently delete this inquiry from the database?"
                        action={async () => {
                          "use server";
                          return deleteInquiry(inquiry.id);
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {inquiries.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                  No inquiries or registrations match this filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
