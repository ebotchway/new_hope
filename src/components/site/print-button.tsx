"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton({ label = "Print Official Receipt" }: { label?: string }) {
  return (
    <Button
      onClick={() => window.print()}
      className="bg-brand-navy hover:bg-brand-navy/90 text-white gap-2 font-medium print:hidden"
    >
      <Printer className="size-4" />
      {label}
    </Button>
  );
}
