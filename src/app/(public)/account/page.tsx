import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { HeartHandshake, HandCoins, ArrowRight, Smartphone, CreditCard, ExternalLink, Receipt } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DonorProfileForm } from "@/components/site/donor-profile-form";
import { formatMoney, formatDate } from "@/lib/format";

export const metadata = { title: "My Donor Portal — LivingHope" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  const userEmail = session.user.email?.toLowerCase().trim();

  const [donations, sponsorships, user] = await Promise.all([
    prisma.donation.findMany({
      where: userEmail
        ? {
            OR: [
              { userId: session.user.id },
              { donorEmail: { equals: userEmail, mode: "insensitive" } },
            ],
          }
        : { userId: session.user.id },
      include: { child: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.sponsorship.findMany({
      where: userEmail
        ? {
            OR: [
              { userId: session.user.id },
              { guestEmail: { equals: userEmail, mode: "insensitive" } },
            ],
          }
        : { userId: session.user.id },
      include: { child: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        role: true,
        createdAt: true,
        name: true,
        phone: true,
        passwordHash: true,
      },
    }),
  ]);

  const totalGivenCents = donations
    .filter((d) => d.status === "SUCCEEDED")
    .reduce((sum, d) => sum + d.amountCents, 0);

  const activeSponsorshipCount = sponsorships.filter((s) => s.status === "ACTIVE").length;

  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Donor Welcome Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl bg-brand-navy p-8 text-white shadow-sm">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border-2 border-white/20">
              <AvatarImage src={session.user.image ?? undefined} />
              <AvatarFallback className="bg-white/10 text-xl font-bold text-white">
                {(session.user.name ?? session.user.email ?? "U").slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  {session.user.name || "Generous Supporter"}
                </h1>
                {user?.role && user.role !== "DONOR" && (
                  <Badge variant="outline" className="border-white/40 text-xs text-white">
                    {user.role}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-white/80">{session.user.email}</p>
            </div>
          </div>

          <div className="flex gap-3">
            {user?.role && user.role !== "DONOR" && (
              <Button asChild variant="outline" className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Link href="/admin">Admin Portal</Link>
              </Button>
            )}
            <Button asChild className="rounded-full bg-white text-brand-navy hover:bg-white/90">
              <Link href="/donate">Make a Gift</Link>
            </Button>
          </div>
        </div>

        {/* Impact Summary Tiles */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border bg-card shadow-xs">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-navy/10 text-brand-navy dark:bg-white/10 dark:text-white">
                <HandCoins className="size-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Given</p>
                <p className="text-2xl font-bold text-foreground">{formatMoney(totalGivenCents)}</p>
                <p className="text-xs text-muted-foreground">{donations.filter((d) => d.status === "SUCCEEDED").length} verified gifts</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-card shadow-xs">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent">
                <HeartHandshake className="size-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Sponsorships</p>
                <p className="text-2xl font-bold text-foreground">{activeSponsorshipCount}</p>
                <p className="text-xs text-muted-foreground">Child{activeSponsorshipCount === 1 ? "" : "ren"} currently supported</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Sponsorships */}
        <Card className="border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">My Sponsored Children</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-xs text-brand-navy dark:text-blue-400">
              <Link href="/sponsor-a-child">
                Browse More Children <ArrowRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {sponsorships.length === 0 ? (
              <div className="rounded-2xl bg-secondary/50 p-8 text-center">
                <p className="text-sm text-muted-foreground">You are not currently sponsoring any children.</p>
                <Button asChild size="sm" className="mt-4 rounded-full">
                  <Link href="/sponsor-a-child">Sponsor a Child Today</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {sponsorships.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 rounded-2xl border p-4 hover:bg-muted/30 transition-colors">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted border">
                      {s.child.photoUrl ? (
                        <Image src={s.child.photoUrl} alt={s.child.name} fill sizes="64px" className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs font-bold text-brand-navy">
                          {s.child.name.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-foreground truncate">{s.child.name}</p>
                        <Badge
                          variant={s.status === "ACTIVE" ? "default" : "secondary"}
                          className={s.status === "ACTIVE" ? "bg-brand-navy text-white text-[10px]" : "text-[10px]"}
                        >
                          {s.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Since {formatDate(s.startDate)}</p>
                      <Link
                        href={`/sponsor-a-child/${s.child.slug}`}
                        className="mt-1.5 inline-flex items-center text-xs font-medium text-brand-navy hover:underline dark:text-blue-400"
                      >
                        View profile & updates <ExternalLink className="ml-1 size-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Donation History */}
        <Card className="border bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Gift &amp; Contribution History</CardTitle>
          </CardHeader>
          <CardContent>
            {donations.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No donations recorded under this account yet.</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {donations.map((d) => (
                  <li key={d.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">
                          {formatMoney(d.amountCents, d.currency)}
                        </span>
                        <Badge variant="outline" className="text-[11px] font-normal">
                          {d.frequency === "MONTHLY" ? "Monthly" : "One-time"}
                        </Badge>
                        <Badge
                          className={
                            d.status === "SUCCEEDED"
                              ? "bg-emerald-600 text-white text-[10px]"
                              : d.status === "PENDING"
                                ? "bg-amber-500 text-white text-[10px]"
                                : "text-[10px]"
                          }
                        >
                          {d.status}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {d.designation.replace("_", " ")}
                        {d.child ? ` · ${d.child.name}` : ""} · {formatDate(d.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {d.paymentMethod === "MOBILE_MONEY" ? (
                        <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                          <Smartphone className="size-3.5" /> Mobile Money
                          {d.momoReference ? ` (${d.momoReference})` : ""}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-medium">
                          <CreditCard className="size-3.5" /> Card
                        </span>
                      )}

                      <Link
                        href={`/receipt/${d.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium text-brand-navy hover:bg-muted dark:text-blue-400 transition-colors"
                        title="View & Print Official Receipt"
                      >
                        <Receipt className="size-3" />
                        Receipt
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Profile Settings & Security */}
        <DonorProfileForm
          initialName={user?.name ?? ""}
          initialPhone={user?.phone ?? ""}
          email={session.user.email ?? ""}
          hasPassword={Boolean(user?.passwordHash)}
        />
      </div>
    </section>
  );
}
