"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateUserRole } from "@/actions/admin/users";
import type { Role } from "@/generated/prisma/enums";

const ROLES: Role[] = ["DONOR", "STAFF", "ADMIN"];

export function UserRoleSelect({ id, role }: { id: string; role: Role }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={role}
      disabled={isPending}
      onChange={(e) =>
        startTransition(async () => {
          const result = await updateUserRole(id, e.target.value as Role);
          if (!result.success) toast.error(result.error);
        })
      }
      className="h-8 rounded-md border border-input bg-white px-2 text-xs"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
