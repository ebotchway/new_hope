import test from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../prisma";
import { getCmsPage } from "../cms-loader";
import { requireStaff, requireAdmin } from "../session";
import type { CmsSection } from "../cms-types";

test("CMS End-to-End Lifecycle & Draft Isolation", async (t) => {
  const testSlug = `test-page-${Date.now()}`;
  let pageId = "";
  let initialRevId = "";
  let draftRevId = "";

  await t.test("1. Create Test Page with Initial Published Revision", async () => {
    const page = await prisma.cmsPage.create({
      data: {
        title: "Test Campaign Page",
        slug: testSlug,
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() - 10000), // Published 10 seconds ago
      },
    });
    pageId = page.id;

    const initialSections: CmsSection[] = [
      {
        id: "hero-1",
        type: "hero",
        props: {
          badge: "Initial Version",
          title: "Initial Published Campaign Title",
          subtitle: "Live subtitle on website",
          alignment: "center",
        },
      },
    ];

    const revision1 = await prisma.cmsRevision.create({
      data: {
        pageId: page.id,
        revisionNumber: 1,
        title: "Initial Published Campaign",
        sections: initialSections,
        changelog: "Initial release",
        isPublished: true,
      },
    });
    initialRevId = revision1.id;

    // Point page to published revision
    await prisma.cmsPage.update({
      where: { id: page.id },
      data: { publishedRevisionId: revision1.id },
    });

    // Verify public view
    const publicPage = await getCmsPage(testSlug, { isStaffPreview: false });
    assert.ok(publicPage !== null);
    assert.equal(publicPage?.sections[0]?.props?.title, "Initial Published Campaign Title");
  });

  await t.test("2. Save Draft Revision - Draft Isolation Check", async () => {
    const draftSections: CmsSection[] = [
      {
        id: "hero-1",
        type: "hero",
        props: {
          badge: "Work In Progress",
          title: "SECRET DRAFT CAMPAIGN TITLE",
          subtitle: "Should not be visible to public",
          alignment: "center",
        },
      },
    ];

    const revision2 = await prisma.cmsRevision.create({
      data: {
        pageId,
        revisionNumber: 2,
        title: "Draft Update with Secret Info",
        sections: draftSections,
        changelog: "Draft modifications",
        isPublished: false,
      },
    });
    draftRevId = revision2.id;

    // Public website must still see the PUBLISHED revision (Draft Isolation)
    const publicView = await getCmsPage(testSlug, { isStaffPreview: false });
    assert.ok(publicView !== null);
    assert.equal(
      publicView?.sections[0]?.props?.title,
      "Initial Published Campaign Title",
      "Draft leaked to public website!"
    );

    // Staff preview must see the DRAFT revision
    const staffView = await getCmsPage(testSlug, { isStaffPreview: true });
    assert.ok(staffView !== null);
    assert.equal(
      staffView?.sections[0]?.props?.title,
      "SECRET DRAFT CAMPAIGN TITLE",
      "Staff preview failed to show latest draft"
    );
  });

  await t.test("3. Publish Draft Revision", async () => {
    // Publish revision 2
    await prisma.$transaction([
      prisma.cmsRevision.updateMany({
        where: { pageId },
        data: { isPublished: false },
      }),
      prisma.cmsRevision.update({
        where: { id: draftRevId },
        data: { isPublished: true },
      }),
      prisma.cmsPage.update({
        where: { id: pageId },
        data: {
          publishedRevisionId: draftRevId,
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      }),
    ]);

    // Public website should immediately serve the new revision
    const publicViewAfterPublish = await getCmsPage(testSlug, { isStaffPreview: false });
    assert.ok(publicViewAfterPublish !== null);
    assert.equal(publicViewAfterPublish?.sections[0]?.props?.title, "SECRET DRAFT CAMPAIGN TITLE");
  });

  await t.test("4. Unpublish Page - Fail-Safe Check", async () => {
    // Unpublish page (status DRAFT)
    await prisma.cmsPage.update({
      where: { id: pageId },
      data: { status: "DRAFT" },
    });

    // Public must receive null (404), NEVER static fallbacks or unpublished content
    const publicUnpublished = await getCmsPage(testSlug, { isStaffPreview: false });
    assert.equal(publicUnpublished, null, "Unpublished page returned content to public visitor!");

    // Staff preview can still view it
    const staffUnpublished = await getCmsPage(testSlug, { isStaffPreview: true });
    assert.ok(staffUnpublished !== null, "Staff preview could not see unpublished page");
  });

  await t.test("5. Scheduled Publishing Boundary Check", async () => {
    // Set publishedAt to 1 hour in the future
    await prisma.cmsPage.update({
      where: { id: pageId },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() + 3600000),
      },
    });

    // Public visitor must get null before scheduled time arrives
    const publicScheduled = await getCmsPage(testSlug, { isStaffPreview: false });
    assert.equal(publicScheduled, null, "Scheduled page was visible to public before publish timestamp!");

    // Staff preview can inspect the scheduled page
    const staffScheduled = await getCmsPage(testSlug, { isStaffPreview: true });
    assert.ok(staffScheduled !== null, "Staff preview blocked from scheduled page");
  });

  await t.test("6. Archived Page Total Blocking", async () => {
    // Archive page
    await prisma.cmsPage.update({
      where: { id: pageId },
      data: { status: "ARCHIVED" },
    });

    // Public must receive null
    const publicArchived = await getCmsPage(testSlug, { isStaffPreview: false });
    assert.equal(publicArchived, null);

    // Staff preview also receives null for archived page
    const staffArchived = await getCmsPage(testSlug, { isStaffPreview: true });
    assert.equal(staffArchived, null, "Archived page should not be previewable");
  });

  await t.test("7. Restore Revision", async () => {
    // Set status back to published and point publishedRevisionId back to initialRevId
    await prisma.$transaction([
      prisma.cmsRevision.updateMany({
        where: { pageId },
        data: { isPublished: false },
      }),
      prisma.cmsRevision.update({
        where: { id: initialRevId },
        data: { isPublished: true },
      }),
      prisma.cmsPage.update({
        where: { id: pageId },
        data: {
          publishedRevisionId: initialRevId,
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      }),
    ]);

    const restoredView = await getCmsPage(testSlug, { isStaffPreview: false });
    assert.ok(restoredView !== null);
    assert.equal(restoredView?.sections[0]?.props?.title, "Initial Published Campaign Title");
  });

  // Cleanup test records
  await prisma.cmsRevision.deleteMany({ where: { pageId } });
  await prisma.cmsPage.delete({ where: { id: pageId } });
});

test("CMS Server-Side Security & Permissions Enforcement", async () => {
  // Test requireStaff without session (throws NEXT_REDIRECT or error)
  let staffRedirected = false;
  try {
    await requireStaff();
  } catch (err: unknown) {
    const errorObj = err as { digest?: string };
    if (errorObj?.digest?.includes("NEXT_REDIRECT") || err instanceof Error) {
      staffRedirected = true;
    }
  }
  assert.equal(staffRedirected, true, "requireStaff must reject unauthenticated requests");

  // Test requireAdmin without session
  let adminRedirected = false;
  try {
    await requireAdmin();
  } catch (err: unknown) {
    const errorObj = err as { digest?: string };
    if (errorObj?.digest?.includes("NEXT_REDIRECT") || err instanceof Error) {
      adminRedirected = true;
    }
  }
  assert.equal(adminRedirected, true, "requireAdmin must reject unauthenticated requests");
});

test.after(async () => {
  await prisma.$disconnect();
  setTimeout(() => process.exit(0), 100).unref();
});
