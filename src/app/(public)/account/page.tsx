import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatDate } from "@/lib/format";

export const metadata = { title: "My Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  const [donations, sponsorships] = await Promise.all([
    prisma.donation.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.sponsorship.findMany({
      where: { userId: session.user.id },
      include: { child: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-4xl space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Welcome back, {session.user.name}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{session.user.email}</p>
        </div>

        <Card className="rounded-2xl border-none bg-secondary shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">My Sponsorships</CardTitle>
          </CardHeader>
          <CardContent>
            {sponsorships.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You&apos;re not sponsoring a child yet.{" "}
                <Link href="/sponsor-a-child" className="font-medium text-foreground underline-offset-4 hover:underline">
                  Browse children
                </Link>
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {sponsorships.map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-3.5 text-sm">
                    <div>
                      <p className="font-medium">{s.child.name}</p>
                      <p className="text-xs text-muted-foreground">Since {formatDate(s.startDate)}</p>
                    </div>
                    <Badge variant={s.status === "ACTIVE" ? "default" : "secondary"} className="rounded-full bg-brand-navy">
                      {s.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none bg-secondary shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Donation History</CardTitle>
          </CardHeader>
          <CardContent>
            {donations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No donations yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {donations.map((d) => (
                  <li key={d.id} className="flex items-center justify-between py-3.5 text-sm">
                    <div>
                      <p className="font-medium">{formatMoney(d.amountCents, d.currency)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(d.createdAt)}</p>
                    </div>
                    <Badge variant="outline" className="rounded-full">{d.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
