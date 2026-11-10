import Link from "next/link";
import { HandCoins, Users2, HeartHandshake, Mail, Smartphone, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DonationsChart } from "@/components/admin/donations-chart";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDate } from "@/lib/format";

export const metadata = { title: "Admin Dashboard — LivingHope" };

function buildDailySeries(
  donations: { createdAt: Date; amountCents: number }[],
  days: number
) {
  const byDay = new Map<string, number>();
  for (const d of donations) {
    const key = d.createdAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + d.amountCents);
  }

  const series: { date: string; amount: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - i);
    const key = date.toISOString().slice(0, 10);
    series.push({ date: key, amount: byDay.get(key) ?? 0 });
  }
  return series;
}

export default async function AdminDashboardPage() {
  await requireStaff();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalRaised,
    donationCount,
    activeSponsorships,
    availableChildren,
    newInquiries,
    pendingMomoCount,
    recentDonations,
    last30DaysDonations,
  ] = await Promise.all([
    prisma.donation.aggregate({ where: { status: "SUCCEEDED" }, _sum: { amountCents: true } }),
    prisma.donation.count({ where: { status: "SUCCEEDED" } }),
    prisma.sponsorship.count({ where: { status: "ACTIVE" } }),
    prisma.child.count({ where: { status: "AVAILABLE", archived: false } }),
    prisma.partnershipInquiry.count({ where: { status: "NEW" } }),
    prisma.donation.count({ where: { status: "PENDING", paymentMethod: "MOBILE_MONEY" } }),
    prisma.donation.findMany({
      where: { status: "SUCCEEDED" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { child: true },
    }),
    prisma.donation.findMany({
      where: { status: "SUCCEEDED", createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, amountCents: true },
    }),
  ]);

  const chartData = buildDailySeries(last30DaysDonations, 30);

  const stats = [
    {
      label: "Total Raised",
      value: formatMoney(totalRaised._sum.amountCents ?? 0),
      hint: `${donationCount} successful gifts`,
      icon: HandCoins,
      href: "/admin/donations",
    },
    {
      label: "Active Sponsorships",
      value: activeSponsorships,
      hint: "Children supported monthly",
      icon: HeartHandshake,
      href: "/admin/children",
    },
    {
      label: "Children Available",
      value: availableChildren,
      hint: "Awaiting a sponsor",
      icon: Users2,
      href: "/admin/children",
    },
    {
      label: "New Inquiries",
      value: newInquiries,
      hint: "Partnership leads to review",
      icon: Mail,
      href: "/admin/inquiries",
    },
  ];

  return (
    <>
      <AdminPageHeader
        title="Operational Dashboard"
        description="Comprehensive overview of LivingHope's impact, sponsorship activity, and financial ledger."
      />

      {pendingMomoCount > 0 && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <Smartphone className="size-5 text-amber-600" />
            <div>
              <p className="font-semibold">
                {pendingMomoCount} Mobile Money Transfer{pendingMomoCount > 1 ? "s" : ""} Pending Verification
              </p>
              <p className="text-xs opacity-90">
                Match incoming SMS confirmations to issue official receipts and activate sponsorships.
              </p>
            </div>
          </div>
          <Link
            href="/admin/donations?method=MOBILE_MONEY&status=PENDING"
            className="flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
          >
            Review Transfers <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="transition-transform hover:-translate-y-0.5">
            <Card className="h-full border bg-card shadow-xs">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </p>
                  <div className="flex size-9 items-center justify-center rounded-xl bg-brand-navy/10 text-brand-navy dark:bg-white/10 dark:text-white">
                    <stat.icon className="size-4.5" />
                  </div>
                </div>
                <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Chart and Recent Ledger */}
      <div className="mt-8 grid gap-6 lg:grid-cols-7">
        <Card className="border bg-card shadow-xs lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Fundraising Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <DonationsChart data={chartData} />
          </CardContent>
        </Card>

        <Card className="border bg-card shadow-xs lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Recent Verified Gifts</CardTitle>
            <Link href="/admin/donations" className="text-xs font-medium text-brand-navy hover:underline dark:text-white">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentDonations.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">No reconciled gifts recorded yet.</p>
            ) : (
              <ul className="divide-y text-xs">
                {recentDonations.map((d) => (
                  <li key={d.id} className="flex items-center justify-between py-3">
                    <div className="max-w-[65%] truncate">
                      <p className="font-semibold text-foreground truncate">{d.anonymous ? "Anonymous" : d.donorName}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {d.designation.replace("_", " ")}
                        {d.child ? ` · ${d.child.name}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{formatMoney(d.amountCents, d.currency)}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(d.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
