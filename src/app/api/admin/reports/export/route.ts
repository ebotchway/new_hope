import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { buildCsvRow } from "@/lib/reports";
import type { DonationStatus, PaymentMethod } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // 1. Enforce server-side staff authorization
  try {
    await requireStaff();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "donations";
  const statusParam = searchParams.get("status") as DonationStatus | null;
  const methodParam = searchParams.get("method") as PaymentMethod | null;
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const todayStr = new Date().toISOString().slice(0, 10);

  // ----------------------------------------------------
  // TYPE 1: DONATIONS LEDGER EXPORT
  // ----------------------------------------------------
  if (type === "donations") {
    const whereClause: {
      status?: DonationStatus;
      paymentMethod?: PaymentMethod;
      createdAt?: { gte?: Date; lte?: Date };
    } = {};

    if (statusParam && ["SUCCEEDED", "PENDING", "FAILED", "REFUNDED"].includes(statusParam)) {
      whereClause.status = statusParam;
    }
    if (methodParam && ["CARD", "MOBILE_MONEY"].includes(methodParam)) {
      whereClause.paymentMethod = methodParam;
    }
    if (fromParam || toParam) {
      whereClause.createdAt = {};
      if (fromParam) whereClause.createdAt.gte = new Date(fromParam);
      if (toParam) whereClause.createdAt.lte = new Date(toParam);
    }

    const donations = await prisma.donation.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 2000,
      include: { child: { select: { name: true } } },
    });

    const header = [
      "Transaction ID",
      "Date",
      "Donor Name",
      "Donor Email",
      "Donor Phone",
      "Amount USD",
      "Amount GHS",
      "Currency",
      "Status",
      "Payment Method",
      "Frequency",
      "Designation",
      "Sponsored Child",
      "Stripe Invoice ID",
      "MoMo Reference",
    ];

    let csvContent = "\uFEFF" + buildCsvRow(header);

    for (const d of donations) {
      csvContent += buildCsvRow([
        d.id,
        d.createdAt.toISOString(),
        d.donorName,
        d.donorEmail,
        d.donorPhone || "",
        (d.amountCents / 100).toFixed(2),
        d.amountGhsCents ? (d.amountGhsCents / 100).toFixed(2) : "",
        d.currency.toUpperCase(),
        d.status,
        d.paymentMethod,
        d.frequency,
        d.designation,
        d.child?.name || "",
        d.stripeInvoiceId || "",
        d.momoReference || "",
      ]);
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="livinghope-donations-${todayStr}.csv"`,
      },
    });
  }

  // ----------------------------------------------------
  // TYPE 2: SPONSORSHIPS REPORT EXPORT
  // ----------------------------------------------------
  if (type === "sponsorships") {
    const sponsorships = await prisma.sponsorship.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        child: { select: { name: true, location: true, school: true } },
        user: { select: { name: true, email: true } },
      },
      take: 2000,
    });

    const header = [
      "Sponsorship ID",
      "Start Date",
      "Status",
      "Tier Type",
      "Monthly Amount USD",
      "Sponsored Child",
      "Child Location",
      "School",
      "Sponsor Name",
      "Sponsor Email",
      "Sponsor Type",
      "Stripe Subscription ID",
    ];

    let csvContent = "\uFEFF" + buildCsvRow(header);

    for (const s of sponsorships) {
      const sponsorName = s.user?.name || s.guestName || "Anonymous";
      const sponsorEmail = s.user?.email || s.guestEmail || "";
      const sponsorType = s.userId ? "Registered User" : "Guest Sponsor";

      csvContent += buildCsvRow([
        s.id,
        s.startDate.toISOString().slice(0, 10),
        s.status,
        s.type,
        (s.monthlyAmountCents / 100).toFixed(2),
        s.child.name,
        s.child.location || "",
        s.child.school || "",
        sponsorName,
        sponsorEmail,
        sponsorType,
        s.stripeSubscriptionId || "",
      ]);
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="livinghope-sponsorships-${todayStr}.csv"`,
      },
    });
  }

  // ----------------------------------------------------
  // TYPE 3: MOBILE MONEY RECONCILIATION EXPORT
  // ----------------------------------------------------
  if (type === "momo") {
    const momoList = await prisma.donation.findMany({
      where: { paymentMethod: "MOBILE_MONEY" },
      orderBy: { createdAt: "desc" },
      take: 2000,
    });

    const header = [
      "Transaction ID",
      "Date Initiated",
      "MoMo Reference",
      "Donor Name",
      "Donor Phone",
      "Expected GHS",
      "Exchange Rate",
      "USD Equivalent",
      "Reconciliation Status",
      "Verified Date",
      "Verified By",
      "Rejection Reason",
    ];

    let csvContent = "\uFEFF" + buildCsvRow(header);

    for (const m of momoList) {
      csvContent += buildCsvRow([
        m.id,
        m.createdAt.toISOString(),
        m.momoReference || "",
        m.donorName,
        m.donorPhone || "",
        m.amountGhsCents ? (m.amountGhsCents / 100).toFixed(2) : "",
        m.exchangeRate ? m.exchangeRate.toFixed(2) : "",
        (m.amountCents / 100).toFixed(2),
        m.status,
        m.momoVerifiedAt ? m.momoVerifiedAt.toISOString() : "",
        m.momoVerifiedBy || "",
        m.momoRejectionReason || "",
      ]);
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="livinghope-momo-reconciliation-${todayStr}.csv"`,
      },
    });
  }

  // ----------------------------------------------------
  // TYPE 4: DONORS REPORT EXPORT
  // ----------------------------------------------------
  if (type === "donors") {
    const donors = await prisma.donation.groupBy({
      by: ["donorEmail"],
      where: { status: "SUCCEEDED" },
      _sum: { amountCents: true },
      _count: { id: true },
      _max: { createdAt: true },
    });

    const header = [
      "Donor Email",
      "Total Gifts Count",
      "Lifetime Contribution USD",
      "Latest Gift Date",
      "Donor Segment",
    ];

    let csvContent = "\uFEFF" + buildCsvRow(header);

    for (const d of donors) {
      const gifts = d._count.id;
      const totalUsd = ((d._sum.amountCents ?? 0) / 100).toFixed(2);
      const segment = gifts > 1 ? "Repeat Donor" : "First-Time Donor";
      const latestDate = d._max.createdAt ? d._max.createdAt.toISOString().slice(0, 10) : "";

      csvContent += buildCsvRow([d.donorEmail, gifts, totalUsd, latestDate, segment]);
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="livinghope-donors-${todayStr}.csv"`,
      },
    });
  }

  return NextResponse.json({ error: `Unsupported export type: ${type}` }, { status: 400 });
}
