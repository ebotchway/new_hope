import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/page-header";
import { InquiryStatusSelect } from "@/components/admin/inquiry-status-select";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Partnership Inquiries" };

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.partnershipInquiry.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <AdminPageHeader
        title="Partnership Inquiries"
        description="People who want to become a Brightener."
        breadcrumbs={[{ label: "Inquiries" }]}
      />

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inquiry) => (
              <TableRow key={inquiry.id}>
                <TableCell>
                  <p className="font-medium">{inquiry.name}</p>
                  <p className="text-xs text-muted-foreground">{inquiry.email}</p>
                  {inquiry.phone && <p className="text-xs text-muted-foreground">{inquiry.phone}</p>}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{inquiry.type.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {inquiry.message || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(inquiry.createdAt)}</TableCell>
                <TableCell>
                  <InquiryStatusSelect id={inquiry.id} status={inquiry.status} />
                </TableCell>
              </TableRow>
            ))}
            {inquiries.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  No inquiries yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
