import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/page-header";
import { InquiryStatusSelect } from "@/components/admin/inquiry-status-select";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { InquiryStatus } from "@/generated/prisma/enums";

export const metadata = { title: "Partnership Inquiries — LivingHope Admin" };

export default async function AdminInquiriesPage(props: PageProps<"/admin/inquiries">) {
  await requireStaff();

  const searchParams = await props.searchParams;
  const statusParam = typeof searchParams.status === "string" ? searchParams.status : undefined;

  const inquiries = await prisma.partnershipInquiry.findMany({
    where: statusParam ? { status: statusParam as InquiryStatus } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <AdminPageHeader
        title="Partnership Inquiries"
        description="Leads and community members expressing interest in becoming a Brightener."
        breadcrumbs={[{ label: "Inquiries" }]}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {[undefined, "NEW", "CONTACTED", "CLOSED"].map((option) => (
          <Link
            key={option ?? "ALL"}
            href={option ? `/admin/inquiries?status=${option}` : "/admin/inquiries"}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              statusParam === option
                ? "border-brand-navy bg-brand-navy text-white dark:border-white dark:bg-white dark:text-brand-navy"
                : "border-input bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {option ? option.charAt(0) + option.slice(1).toLowerCase() : "All Statuses"}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40">
              <TableHead>Contact</TableHead>
              <TableHead>Partnership Type</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Submitted Date</TableHead>
              <TableHead className="w-36">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inquiry) => (
              <TableRow key={inquiry.id} className="hover:bg-muted/40">
                <TableCell>
                  <p className="font-semibold text-foreground">{inquiry.name}</p>
                  <p className="text-xs text-muted-foreground">{inquiry.email}</p>
                  {inquiry.phone && <p className="text-[11px] text-muted-foreground/80">{inquiry.phone}</p>}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    {inquiry.type.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md text-xs leading-relaxed text-muted-foreground">
                  <div className="line-clamp-3 whitespace-pre-wrap">{inquiry.message || "—"}</div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(inquiry.createdAt)}
                </TableCell>
                <TableCell>
                  <InquiryStatusSelect id={inquiry.id} status={inquiry.status} />
                </TableCell>
              </TableRow>
            ))}
            {inquiries.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                  No partnership inquiries match this view.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
