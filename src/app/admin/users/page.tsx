import { Users, Shield, HeartHandshake, UserCheck } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/page-header";
import { UserRoleSelect } from "@/components/admin/user-role-select";
import { DeleteButton } from "@/components/admin/delete-button";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { deleteUser } from "@/actions/admin/users";
import { formatDate } from "@/lib/format";

export const metadata = {
  title: "User Management & Role Permissions — LivingHope Admin",
  description: "Manage donor portal accounts, staff permissions, and administrator access.",
};

export default async function AdminUsersPage() {
  const session = await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { donations: true, sponsorships: true },
      },
    },
  });

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const staffCount = users.filter((u) => u.role === "STAFF").length;
  const donorCount = users.filter((u) => u.role === "DONOR" || u._count.donations > 0).length;

  return (
    <>
      <AdminPageHeader
        title="User Accounts & Permissions"
        description="Manage administrator access, staff permissions, and registered donor accounts."
        breadcrumbs={[{ label: "Users" }]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Users className="size-4 text-brand-navy dark:text-blue-400" />
            Total Accounts
          </div>
          <p className="mt-2 text-2xl font-bold font-heading text-foreground">{totalUsers}</p>
          <p className="mt-1 text-xs text-muted-foreground">Registered in platform</p>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Shield className="size-4 text-brand-accent" />
            Administrators
          </div>
          <p className="mt-2 text-2xl font-bold font-heading text-brand-accent">{adminCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">Full system control</p>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <UserCheck className="size-4 text-emerald-600" />
            Staff Members
          </div>
          <p className="mt-2 text-2xl font-bold font-heading text-emerald-600 dark:text-emerald-400">
            {staffCount}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Operations & content</p>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <HeartHandshake className="size-4 text-brand-gold-dark" />
            Supporters & Donors
          </div>
          <p className="mt-2 text-2xl font-bold font-heading text-foreground">{donorCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">Public donor accounts</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40">
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Contributions</TableHead>
              <TableHead>Assigned Role</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isCurrentUser = user.id === session.user.id;
              const hasFinancialRecords = user._count.donations > 0;

              return (
                <TableRow key={user.id} className="hover:bg-muted/40">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{user.name ?? "—"}</span>
                      {isCurrentUser && (
                        <Badge
                          variant="outline"
                          className="border-brand-navy/30 bg-brand-navy/10 text-brand-navy text-[10px]"
                        >
                          You
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    <span>{user.email}</span>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span title="Realized Donations">
                        <strong>{user._count.donations}</strong> {user._count.donations === 1 ? "donation" : "donations"}
                      </span>
                      {user._count.sponsorships > 0 && (
                        <span title="Active/Past Child Sponsorships">
                          • <strong>{user._count.sponsorships}</strong> {user._count.sponsorships === 1 ? "sponsorship" : "sponsorships"}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <UserRoleSelect id={user.id} role={user.role} />
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(user.createdAt)}
                  </TableCell>

                  <TableCell className="text-right">
                    {!isCurrentUser && !hasFinancialRecords && (
                      <DeleteButton
                        action={deleteUser.bind(null, user.id)}
                        confirmMessage={`Permanently delete the user account for ${user.name || user.email}?`}
                      />
                    )}
                    {hasFinancialRecords && !isCurrentUser && (
                      <span
                        className="text-[11px] text-muted-foreground/60 italic"
                        title="Cannot delete user with realized financial donation records for tax/audit compliance"
                      >
                        Audited
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
