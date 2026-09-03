"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateUserRole } from "@/actions/admin/users";
import type { Role } from "@/generated/prisma/enums";

const ROLES: Role[] = ["DONOR", "STAFF", "ADMIN"];

export function UserRoleSelect({ id, role }: { id: string; role: Role }) {
  const [value, setValue] = useState<Role>(role);
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={value}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as Role;
        setValue(next);
        startTransition(async () => {
          const result = await updateUserRole(id, next);
          if (!result.success) {
            toast.error(result.error);
            setValue(role); // the change was blocked server-side — don't leave the UI showing it as applied
          }
        });
      }}
      className="h-8 rounded-md border border-input bg-card px-2 text-xs"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
