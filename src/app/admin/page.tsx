import Link from "next/link";
import { HandCoins, Users2, HeartHandshake, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DonationsChart } from "@/components/admin/donations-chart";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDate } from "@/lib/format";

export const metadata = { title: "Admin Dashboard" };

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
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalRaised,
    donationCount,
    activeSponsorships,
    availableChildren,
    newInquiries,
    recentDonations,
    last30DaysDonations,
  ] = await Promise.all([
    prisma.donation.aggregate({ where: { status: "SUCCEEDED" }, _sum: { amountCents: true } }),
    prisma.donation.count({ where: { status: "SUCCEEDED" } }),
    prisma.sponsorship.count({ where: { status: "ACTIVE" } }),
    prisma.child.count({ where: { status: "AVAILABLE" } }),
    prisma.partnershipInquiry.count({ where: { status: "NEW" } }),
    prisma.donation.findMany({
      where: { status: "SUCCEEDED" },
      orderBy: { createdAt: "desc" },
      take: 8,
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
      hint: `${donationCount} successful donations`,
      icon: HandCoins,
    },
    {
      label: "Active Sponsorships",
      value: activeSponsorships,
      hint: "Children currently sponsored",
      icon: HeartHandshake,
    },
    {
      label: "Children Available",
      value: availableChildren,
      hint: "Waiting for a sponsor",
      icon: Users2,
    },
    {
      label: "New Inquiries",
      value: newInquiries,
      hint: "Partnership inquiries to review",
      icon: Mail,
    },
  ];

  return (
    <>
      <AdminPageHeader title="Dashboard" description="An overview of LivingHope's impact and activity." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <stat.icon className="size-4 text-brand-navy" />
              </div>
              <p className="mt-2 text-2xl font-bold text-brand-navy">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Donations, Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <DonationsChart data={chartData} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Donations</CardTitle>
          <Link href="/admin/donations" className="text-sm text-brand-navy hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {recentDonations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No donations yet.</p>
          ) : (
            <ul className="divide-y">
              {recentDonations.map((donation) => (
                <li key={donation.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">
                      {donation.anonymous ? "Anonymous" : donation.donorName}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(donation.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{donation.designation.replace("_", " ")}</Badge>
                    <span className="font-semibold">{formatMoney(donation.amountCents, donation.currency)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
