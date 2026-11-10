import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { NavigationManager } from "@/components/admin/cms/navigation-manager";

export const metadata = {
  title: "Navigation & Menus | LivingHope Admin",
};

export default async function AdminNavigationPage() {
  await requireStaff();

  const items = await prisma.cmsNavItem.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <NavigationManager
      initialItems={items.map((i) => ({
        id: i.id,
        menu: i.menu,
        label: i.label,
        href: i.href,
        order: i.order,
        isExternal: i.isExternal,
        published: i.published,
      }))}
    />
  );
}

