import { prisma } from "@/lib/prisma";
import type { PaymentMethod } from "@/generated/prisma/enums";

// ==========================================
// CSV FORMULA INJECTION PROTECTION
// ==========================================

/**
 * Sanitizes a string value to prevent CSV Formula Injection (CWE-1236).
 * Values starting with =, +, -, @, \t, or \r can be interpreted as executable formulas
 * by spreadsheet applications like Microsoft Excel, LibreOffice, or Google Sheets.
 * Prepends a single quote (') to force text evaluation.
 */
export function sanitizeCsvField(val: unknown): string {
  if (val === null || val === undefined) return "";
  let str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  // Escape embedded double quotes by doubling them
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsvRow(fields: unknown[]): string {
  return fields.map(sanitizeCsvField).join(",") + "\r\n";
}

// ==========================================
// DATE RANGE FILTER UTILITIES
// ==========================================

export interface DateRangeFilter {
  period?: "today" | "7d" | "30d" | "this_month" | "last_month" | "this_quarter" | "this_year" | "all_time" | "custom";
  from?: Date;
  to?: Date;
}

export function resolveDateRange(filter?: DateRangeFilter): { from?: Date; to?: Date; label: string } {
  const now = new Date();

  if (!filter || !filter.period || filter.period === "all_time") {
    return { label: "All Time" };
  }

  if (filter.period === "today") {
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
    return { from, to, label: "Today" };
  }

  if (filter.period === "7d") {
    const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { from, to: now, label: "Last 7 Days" };
  }

  if (filter.period === "30d") {
    const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { from, to: now, label: "Last 30 Days" };
  }

  if (filter.period === "this_month") {
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
    return { from, to: now, label: "This Month" };
  }

  if (filter.period === "last_month") {
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0));
    const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999));
    return { from, to, label: "Last Month" };
  }

  if (filter.period === "this_quarter") {
    const quarterMonth = Math.floor(now.getUTCMonth() / 3) * 3;
    const from = new Date(Date.UTC(now.getUTCFullYear(), quarterMonth, 1, 0, 0, 0));
    return { from, to: now, label: "This Quarter" };
  }

  if (filter.period === "this_year") {
    const from = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0));
    return { from, to: now, label: "This Year" };
  }

  if (filter.period === "custom" && (filter.from || filter.to)) {
    return {
      from: filter.from,
      to: filter.to,
      label: `Custom (${filter.from ? filter.from.toISOString().slice(0, 10) : "Start"} to ${filter.to ? filter.to.toISOString().slice(0, 10) : "Now"})`,
    };
  }

  return { label: "All Time" };
}

// ==========================================
// 1. EXECUTIVE REPORTING OVERVIEW
// ==========================================

export async function getExecutiveReportingOverview() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    realizedUsd,
    realizedGhs,
    realizedCount,
    pendingMomo,
    pendingMomoCount,
    activeSponsorships,
    availableChildren,
    sponsoredChildren,
    recentDailyDonations,
    mrcvAggregate,
  ] = await Promise.all([
    // Realized USD Cash
    prisma.donation.aggregate({
      where: { status: "SUCCEEDED", currency: "usd" },
      _sum: { amountCents: true },
    }),
    // Realized GHS Cash (sum of amountGhsCents)
    prisma.donation.aggregate({
      where: { status: "SUCCEEDED", amountGhsCents: { not: null } },
      _sum: { amountGhsCents: true },
    }),
    // Total Realized Transactions Count
    prisma.donation.count({ where: { status: "SUCCEEDED" } }),
    // Pending MoMo funds awaiting manual bank confirmation
    prisma.donation.aggregate({
      where: { status: "PENDING", paymentMethod: "MOBILE_MONEY" },
      _sum: { amountGhsCents: true, amountCents: true },
    }),
    prisma.donation.count({
      where: { status: "PENDING", paymentMethod: "MOBILE_MONEY" },
    }),
    // Active Monthly Sponsorships
    prisma.sponsorship.count({ where: { status: "ACTIVE" } }),
    // Beneficiary Counts
    prisma.child.count({ where: { status: "AVAILABLE", archived: false } }),
    prisma.child.count({ where: { status: "SPONSORED", archived: false } }),
    // Last 30 days velocity
    prisma.donation.findMany({
      where: { status: "SUCCEEDED", createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, amountCents: true, currency: true },
    }),
    // Monthly Recurring Contribution Value (MRCV) from active sponsorships
    prisma.sponsorship.aggregate({
      where: { status: "ACTIVE" },
      _sum: { monthlyAmountCents: true },
    }),
  ]);

  // Aggregate daily velocity
  const dailyMap = new Map<string, number>();
  for (const d of recentDailyDonations) {
    const key = d.createdAt.toISOString().slice(0, 10);
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + d.amountCents);
  }

  const velocityChart: { date: string; amount: number; formatted: string }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    const cents = dailyMap.get(key) ?? 0;
    velocityChart.push({
      date: key,
      amount: cents / 100,
      formatted: `$${(cents / 100).toFixed(2)}`,
    });
  }

  return {
    realizedUsdCents: realizedUsd._sum.amountCents ?? 0,
    realizedGhsCents: realizedGhs._sum.amountGhsCents ?? 0,
    realizedCount,
    mrcvUsdCents: mrcvAggregate._sum.monthlyAmountCents ?? 0,
    pendingMomoGhsCents: pendingMomo._sum.amountGhsCents ?? 0,
    pendingMomoCount,
    activeSponsorships,
    availableChildren,
    sponsoredChildren,
    coverageRatio:
      availableChildren + sponsoredChildren > 0
        ? Math.round((sponsoredChildren / (availableChildren + sponsoredChildren)) * 100)
        : 0,
    velocityChart,
  };
}

// ==========================================
// 2. FINANCIAL REPORTING
// ==========================================

export interface FinancialReportFilter extends DateRangeFilter {
  currency?: string;
  paymentMethod?: PaymentMethod;
}

export async function getFinancialReport(filter?: FinancialReportFilter) {
  const { from, to, label: periodLabel } = resolveDateRange(filter);

  const createdAtClause: { gte?: Date; lte?: Date } = {};
  if (from) createdAtClause.gte = from;
  if (to) createdAtClause.lte = to;

  const baseWhere: {
    createdAt?: { gte?: Date; lte?: Date };
    paymentMethod?: PaymentMethod;
    currency?: string;
  } = {};

  if (from || to) baseWhere.createdAt = createdAtClause;
  if (filter?.paymentMethod) baseWhere.paymentMethod = filter.paymentMethod;
  if (filter?.currency) baseWhere.currency = filter.currency.toLowerCase();

  const [
    succeededUsd,
    succeededGhs,
    refundedUsd,
    failedUsd,
    pendingUsd,
    pendingGhs,
    cardDonations,
    momoDonations,
    oneTimeCount,
    recurringCount,
    recentTransactions,
  ] = await Promise.all([
    // Realized Succeeded USD
    prisma.donation.aggregate({
      where: { ...baseWhere, status: "SUCCEEDED", currency: "usd" },
      _sum: { amountCents: true },
      _count: true,
    }),
    // Realized Succeeded GHS
    prisma.donation.aggregate({
      where: { ...baseWhere, status: "SUCCEEDED", amountGhsCents: { not: null } },
      _sum: { amountGhsCents: true },
      _count: true,
    }),
    // Refunded USD
    prisma.donation.aggregate({
      where: { ...baseWhere, status: "REFUNDED" },
      _sum: { amountCents: true },
      _count: true,
    }),
    // Failed USD
    prisma.donation.aggregate({
      where: { ...baseWhere, status: "FAILED" },
      _sum: { amountCents: true },
      _count: true,
    }),
    // Pending USD
    prisma.donation.aggregate({
      where: { ...baseWhere, status: "PENDING" },
      _sum: { amountCents: true },
      _count: true,
    }),
    // Pending GHS (MoMo)
    prisma.donation.aggregate({
      where: { ...baseWhere, status: "PENDING", amountGhsCents: { not: null } },
      _sum: { amountGhsCents: true },
      _count: true,
    }),
    // By Payment Method - Card
    prisma.donation.aggregate({
      where: { ...baseWhere, status: "SUCCEEDED", paymentMethod: "CARD" },
      _sum: { amountCents: true },
      _count: true,
    }),
    // By Payment Method - Mobile Money
    prisma.donation.aggregate({
      where: { ...baseWhere, status: "SUCCEEDED", paymentMethod: "MOBILE_MONEY" },
      _sum: { amountGhsCents: true, amountCents: true },
      _count: true,
    }),
    // By Frequency
    prisma.donation.count({
      where: { ...baseWhere, status: "SUCCEEDED", frequency: "ONE_TIME" },
    }),
    prisma.donation.count({
      where: { ...baseWhere, status: "SUCCEEDED", frequency: "MONTHLY" },
    }),
    // Ledger sample
    prisma.donation.findMany({
      where: baseWhere,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { child: { select: { name: true } }, user: { select: { email: true } } },
    }),
  ]);

  const grossUsdCents = succeededUsd._sum.amountCents ?? 0;
  const refundedUsdCents = refundedUsd._sum.amountCents ?? 0;
  const netUsdCents = Math.max(0, grossUsdCents - refundedUsdCents);

  // Processing fee estimation based on provider published charity rates
  // Stripe standard: 2.9% + $0.30 per successful card transaction
  const cardSucceededCount = cardDonations._count;
  const cardGrossCents = cardDonations._sum.amountCents ?? 0;
  const estimatedStripeFeesCents =
    cardSucceededCount > 0 ? Math.round(cardGrossCents * 0.029 + cardSucceededCount * 30) : 0;

  // MoMo merchant gateway standard: 1.0% fee
  const momoGrossGhsCents = momoDonations._sum.amountGhsCents ?? 0;
  const estimatedMomoFeesGhsCents = Math.round(momoGrossGhsCents * 0.01);

  return {
    periodLabel,
    totals: {
      grossUsdCents,
      refundedUsdCents,
      netUsdCents,
      estimatedStripeFeesCents,
      netUsdAfterFeesCents: Math.max(0, netUsdCents - estimatedStripeFeesCents),
      realizedGhsCents: succeededGhs._sum.amountGhsCents ?? 0,
      estimatedMomoFeesGhsCents,
      netGhsAfterFeesCents: Math.max(0, (succeededGhs._sum.amountGhsCents ?? 0) - estimatedMomoFeesGhsCents),
      pendingUsdCents: pendingUsd._sum.amountCents ?? 0,
      pendingGhsCents: pendingGhs._sum.amountGhsCents ?? 0,
      failedUsdCents: failedUsd._sum.amountCents ?? 0,
    },
    counts: {
      succeeded: succeededUsd._count,
      refunded: refundedUsd._count,
      failed: failedUsd._count,
      pending: pendingUsd._count,
      card: cardSucceededCount,
      momo: momoDonations._count,
      oneTime: oneTimeCount,
      recurring: recurringCount,
    },
    recentTransactions,
  };
}

// ==========================================
// 3. RECURRING GIVING & SUBSCRIPTION REPORTS
// ==========================================

export async function getRecurringGivingReport() {
  const [
    activeSponsorships,
    pausedSponsorships,
    endedSponsorships,
    mrcvAggregate,
    totalMonthlyDonations,
    recurringDonations,
    distinctSubIds,
  ] = await Promise.all([
    prisma.sponsorship.count({ where: { status: "ACTIVE" } }),
    prisma.sponsorship.count({ where: { status: "PAUSED" } }),
    prisma.sponsorship.count({ where: { status: "ENDED" } }),
    prisma.sponsorship.aggregate({
      where: { status: "ACTIVE" },
      _sum: { monthlyAmountCents: true },
    }),
    prisma.donation.count({
      where: { status: "SUCCEEDED", frequency: "MONTHLY" },
    }),
    prisma.donation.findMany({
      where: { frequency: "MONTHLY" },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { child: { select: { name: true } } },
    }),
    prisma.donation.findMany({
      where: { stripeSubscriptionId: { not: null } },
      select: { stripeSubscriptionId: true },
      distinct: ["stripeSubscriptionId"],
    }),
  ]);

  const activeCount = activeSponsorships;
  const churnedCount = endedSponsorships;
  const totalTracked = activeCount + pausedSponsorships + churnedCount;
  const retentionRate = totalTracked > 0 ? Math.round((activeCount / totalTracked) * 100) : 100;

  return {
    activeSubscriptionsCount: activeCount,
    pausedSubscriptionsCount: pausedSponsorships,
    endedSubscriptionsCount: churnedCount,
    retentionRatePercent: retentionRate,
    mrcvUsdCents: mrcvAggregate._sum.monthlyAmountCents ?? 0,
    totalSuccessfulRenewalsCount: totalMonthlyDonations,
    uniqueActiveSubscribersEstimate: distinctSubIds.length,
    recentRenewals: recurringDonations,
  };
}

// ==========================================
// 4. SPONSORSHIP OPERATIONAL REPORT
// ==========================================

export async function getSponsorshipReport() {
  const [
    totalChildren,
    availableChildren,
    sponsoredChildren,
    graduatedChildren,
    archivedChildren,
    activeSponsorshipsList,
    fullTiersCount,
    partialTiersCount,
  ] = await Promise.all([
    prisma.child.count(),
    prisma.child.count({ where: { status: "AVAILABLE", archived: false } }),
    prisma.child.count({ where: { status: "SPONSORED", archived: false } }),
    prisma.child.count({ where: { status: "GRADUATED", archived: false } }),
    prisma.child.count({ where: { archived: true } }),
    prisma.sponsorship.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: {
        child: { select: { name: true, slug: true, location: true, school: true } },
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.sponsorship.count({ where: { type: "FULL", status: "ACTIVE" } }),
    prisma.sponsorship.count({ where: { type: "CONTRIBUTION", status: "ACTIVE" } }),
  ]);

  const coverageRatio =
    availableChildren + sponsoredChildren > 0
      ? Math.round((sponsoredChildren / (availableChildren + sponsoredChildren)) * 100)
      : 0;

  // Registered vs Guest sponsors count
  let guestSponsorsCount = 0;
  let registeredSponsorsCount = 0;
  for (const sp of activeSponsorshipsList) {
    if (sp.userId) registeredSponsorsCount++;
    else if (sp.guestEmail) guestSponsorsCount++;
  }

  return {
    children: {
      total: totalChildren,
      available: availableChildren,
      sponsored: sponsoredChildren,
      graduated: graduatedChildren,
      archived: archivedChildren,
      coverageRatioPercent: coverageRatio,
    },
    sponsorships: {
      total: activeSponsorshipsList.length,
      fullTiers: fullTiersCount,
      partialTiers: partialTiersCount,
      registeredSponsorsCount,
      guestSponsorsCount,
    },
    sponsorshipsList: activeSponsorshipsList,
  };
}

// ==========================================
// 5. DONOR LIFECYCLE & RETENTION REPORT
// ==========================================

export async function getDonorReport() {
  const [registeredUsersCount, distinctDonors] = await Promise.all([
    prisma.user.count({ where: { role: "DONOR" } }),
    prisma.donation.groupBy({
      by: ["donorEmail"],
      where: { status: "SUCCEEDED" },
      _sum: { amountCents: true },
      _count: { id: true },
      _max: { createdAt: true },
    }),
  ]);

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  let firstTimeDonorsCount = 0;
  let repeatDonorsCount = 0;
  let activeIn90DaysCount = 0;
  let lapsedCount = 0;

  // Giving tiers
  let tierMajor1000Plus = 0;
  let tierMid500to999 = 0;
  let tierRegular100to499 = 0;
  let tierGrassrootsUnder100 = 0;

  const donorSummaries = distinctDonors.map((d) => {
    const totalGifts = d._count.id;
    const totalCents = d._sum.amountCents ?? 0;
    const lastGiftDate = d._max.createdAt ? new Date(d._max.createdAt) : new Date();

    if (totalGifts === 1) firstTimeDonorsCount++;
    else repeatDonorsCount++;

    if (lastGiftDate >= ninetyDaysAgo) activeIn90DaysCount++;
    else lapsedCount++;

    const totalUsd = totalCents / 100;
    if (totalUsd >= 1000) tierMajor1000Plus++;
    else if (totalUsd >= 500) tierMid500to999++;
    else if (totalUsd >= 100) tierRegular100to499++;
    else tierGrassrootsUnder100++;

    return {
      email: d.donorEmail,
      giftCount: totalGifts,
      totalContributedCents: totalCents,
      latestGiftAt: lastGiftDate,
    };
  });

  donorSummaries.sort((a, b) => b.totalContributedCents - a.totalContributedCents);

  return {
    totalDistinctDonors: distinctDonors.length,
    registeredUsersCount,
    firstTimeDonorsCount,
    repeatDonorsCount,
    repeatDonorRatePercent:
      distinctDonors.length > 0 ? Math.round((repeatDonorsCount / distinctDonors.length) * 100) : 0,
    activeIn90DaysCount,
    lapsedCount,
    tiers: {
      major1000Plus: tierMajor1000Plus,
      mid500to999: tierMid500to999,
      regular100to499: tierRegular100to499,
      grassrootsUnder100: tierGrassrootsUnder100,
    },
    topDonors: donorSummaries.slice(0, 50),
  };
}

// ==========================================
// 6. MOBILE MONEY RECONCILIATION REPORT
// ==========================================

export async function getMobileMoneyReconciliationReport() {
  const [pendingMomo, verifiedMomo, rejectedMomo, allMomoRecords] = await Promise.all([
    prisma.donation.aggregate({
      where: { paymentMethod: "MOBILE_MONEY", status: "PENDING" },
      _sum: { amountGhsCents: true, amountCents: true },
      _count: true,
    }),
    prisma.donation.aggregate({
      where: { paymentMethod: "MOBILE_MONEY", status: "SUCCEEDED" },
      _sum: { amountGhsCents: true, amountCents: true },
      _count: true,
    }),
    prisma.donation.aggregate({
      where: { paymentMethod: "MOBILE_MONEY", status: "FAILED" },
      _sum: { amountGhsCents: true, amountCents: true },
      _count: true,
    }),
    prisma.donation.findMany({
      where: { paymentMethod: "MOBILE_MONEY" },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        momoReference: true,
        donorName: true,
        donorPhone: true,
        amountGhsCents: true,
        amountCents: true,
        exchangeRate: true,
        status: true,
        momoVerifiedAt: true,
        momoVerifiedBy: true,
        momoRejectionReason: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    pending: {
      count: pendingMomo._count,
      ghsCents: pendingMomo._sum.amountGhsCents ?? 0,
      usdEquivalentCents: pendingMomo._sum.amountCents ?? 0,
    },
    verified: {
      count: verifiedMomo._count,
      ghsCents: verifiedMomo._sum.amountGhsCents ?? 0,
      usdEquivalentCents: verifiedMomo._sum.amountCents ?? 0,
    },
    rejected: {
      count: rejectedMomo._count,
      ghsCents: rejectedMomo._sum.amountGhsCents ?? 0,
    },
    records: allMomoRecords,
  };
}

// ==========================================
// 7. PAYMENT RECONCILIATION AUDIT
// ==========================================

export async function getPaymentReconciliationAudit() {
  const [
    totalCardDonations,
    missingInvoiceRecords,
    duplicateInvoices,
    unmatchedPaymentIntents,
    recentCardLedger,
  ] = await Promise.all([
    prisma.donation.count({ where: { paymentMethod: "CARD" } }),
    // Missing invoice ID for recurring donations
    prisma.donation.count({
      where: {
        paymentMethod: "CARD",
        frequency: "MONTHLY",
        status: "SUCCEEDED",
        stripeInvoiceId: null,
      },
    }),
    // Duplicate invoice ID check (should be 0 due to unique constraint)
    prisma.donation.groupBy({
      by: ["stripeInvoiceId"],
      where: { stripeInvoiceId: { not: null } },
      _count: { id: true },
      having: { id: { _count: { gt: 1 } } },
    }),
    // Transactions with status PENDING older than 24 hours (potential abandoned checkouts)
    prisma.donation.count({
      where: {
        paymentMethod: "CARD",
        status: "PENDING",
        createdAt: { lte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.donation.findMany({
      where: { paymentMethod: "CARD" },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        donorName: true,
        donorEmail: true,
        amountCents: true,
        currency: true,
        status: true,
        stripeCheckoutSessionId: true,
        stripePaymentIntentId: true,
        stripeInvoiceId: true,
        stripeSubscriptionId: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    totalCardDonations,
    missingInvoiceRecords,
    duplicateInvoicesCount: duplicateInvoices.length,
    abandonedCheckoutCandidates: unmatchedPaymentIntents,
    ledger: recentCardLedger,
  };
}

// ==========================================
// 8. WEBSITE & CMS CONTENT REPORT
// ==========================================

export async function getWebsiteContentReport() {
  const [
    totalPages,
    publishedPages,
    draftPages,
    archivedPages,
    totalRevisions,
    recentAuditLogs,
    mediaAssets,
    scheduledPages,
  ] = await Promise.all([
    prisma.cmsPage.count(),
    prisma.cmsPage.count({ where: { status: "PUBLISHED" } }),
    prisma.cmsPage.count({ where: { status: "DRAFT" } }),
    prisma.cmsPage.count({ where: { status: "ARCHIVED" } }),
    prisma.cmsRevision.count(),
    prisma.cmsAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.cmsMediaAsset.findMany({
      select: { sizeBytes: true, folder: true, altText: true },
    }),
    prisma.cmsPage.count({
      where: {
        status: "PUBLISHED",
        publishedAt: { gt: new Date() },
      },
    }),
  ]);

  let totalStorageBytes = 0;
  let missingAltTextCount = 0;
  const folderCounts: Record<string, number> = {};

  for (const asset of mediaAssets) {
    totalStorageBytes += asset.sizeBytes;
    if (!asset.altText || asset.altText.trim() === "") {
      missingAltTextCount++;
    }
    const f = asset.folder || "general";
    folderCounts[f] = (folderCounts[f] ?? 0) + 1;
  }

  return {
    pages: {
      total: totalPages,
      published: publishedPages,
      draft: draftPages,
      archived: archivedPages,
      scheduled: scheduledPages,
    },
    totalRevisions,
    media: {
      totalAssets: mediaAssets.length,
      storageMb: (totalStorageBytes / (1024 * 1024)).toFixed(2),
      missingAltTextCount,
      folderDistribution: folderCounts,
    },
    recentAuditLogs,
  };
}
