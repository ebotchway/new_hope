"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  type: string;
  status?: string;
  method?: string;
  from?: string;
  to?: string;
  label?: string;
  className?: string;
}

export function ExportButton({
  type,
  status,
  method,
  from,
  to,
  label = "Export CSV",
  className,
}: ExportButtonProps) {
  const handleExport = () => {
    const params = new URLSearchParams({ type });
    if (status) params.set("status", status);
    if (method) params.set("method", method);
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    window.open(`/api/admin/reports/export?${params.toString()}`, "_blank");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      className={`rounded-xl gap-2 font-medium border-border/80 hover:bg-secondary ${className || ""}`}
    >
      <Download className="size-4 text-brand-primary" />
      <span>{label}</span>
    </Button>
  );
}

