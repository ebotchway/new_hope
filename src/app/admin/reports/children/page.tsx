import Link from "next/link";
import { GraduationCap, Users, HeartHandshake } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportHeader } from "@/components/admin/reports/report-header";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Beneficiary Reports & Program Roster | LivingHope Admin",
};

export default async function ChildrenReportPage() {
  await requireStaff();

  const [
    totalChildren,
    availableCount,
    sponsoredCount,
    graduatedCount,
    archivedCount,
    maleCount,
    femaleCount,
    childrenList,
  ] = await Promise.all([
    prisma.child.count(),
    prisma.child.count({ where: { status: "AVAILABLE", archived: false } }),
    prisma.child.count({ where: { status: "SPONSORED", archived: false } }),
    prisma.child.count({ where: { status: "GRADUATED", archived: false } }),
    prisma.child.count({ where: { archived: true } }),
    prisma.child.count({ where: { gender: "MALE", archived: false } }),
    prisma.child.count({ where: { gender: "FEMALE", archived: false } }),
    prisma.child.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { updates: true, sponsorships: true } },
      },
    }),
  ]);

  const coverageRatio =
    availableCount + sponsoredCount > 0
      ? Math.round((sponsoredCount / (availableCount + sponsoredCount)) * 100)
      : 0;

  return (
    <div className="space-y-8 max-w-7xl">
      <ReportHeader
        title="Beneficiary Demographics & Educational Roster"
        description="Comprehensive audit of children under care, schooling enrollment, updates pacing, and sponsorship status."
        breadcrumbs={[{ label: "Beneficiaries" }]}
        showPeriodSelector={false}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Total Beneficiaries
            </CardTitle>
            <GraduationCap className="size-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {totalChildren}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalChildren - archivedCount} active public profiles
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Currently Sponsored
            </CardTitle>
            <HeartHandshake className="size-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {sponsoredCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {coverageRatio}% coverage of enrolled children
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Awaiting Sponsors
            </CardTitle>
            <Users className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading text-foreground">
              {availableCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Urgent need for education & nutrition
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Gender Distribution
            </CardTitle>
            <Users className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-heading text-foreground">
              {maleCount} Male · {femaleCount} Female
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {graduatedCount} successfully graduated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Children Directory Table */}
      <Card className="rounded-2xl border border-border/80 bg-card overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-foreground">
              Beneficiary Program Roster
            </h3>
            <p className="text-xs text-muted-foreground">Persisted profile records, school enrollment, and progress updates count</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-xs uppercase bg-muted/30">
                <TableHead>Child Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress Updates</TableHead>
                <TableHead>Sponsorships</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {childrenList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                    No children profiles currently in database.
                  </TableCell>
                </TableRow>
              ) : (
                childrenList.map((c) => (
                  <TableRow key={c.id} className="text-xs hover:bg-muted/40">
                    <TableCell className="font-bold text-foreground">
                      <Link href={`/admin/children/${c.id}`} className="hover:text-brand-primary transition-colors">
                        {c.name}
                      </Link>
                      {c.archived && (
                        <Badge variant="outline" className="ml-2 text-[9px] uppercase border-destructive/40 text-destructive">
                          Archived
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">
                        {c.gender}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.school || "Community School"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.location || "Accra, Ghana"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[10px] uppercase ${
                          c.status === "SPONSORED"
                            ? "bg-purple-600 text-white"
                            : c.status === "AVAILABLE"
                              ? "bg-emerald-600 text-white"
                              : "bg-blue-600 text-white"
                        }`}
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-center">
                      <span className="font-bold text-foreground">{c._count.updates}</span>
                      <span className="text-muted-foreground text-[10px]"> reports</span>
                    </TableCell>
                    <TableCell className="font-mono text-center">
                      <span className="font-bold text-foreground">{c._count.sponsorships}</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
