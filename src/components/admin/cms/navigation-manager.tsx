"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { saveNavItems } from "@/actions/admin/cms";
import type { NavMenu } from "@/generated/prisma/enums";

export interface NavItemRecord {
  id?: string;
  menu: NavMenu;
  label: string;
  href: string;
  order: number;
  isExternal: boolean;
  published: boolean;
}

export function NavigationManager({ initialItems }: { initialItems: NavItemRecord[] }) {
  const [items, setItems] = useState<NavItemRecord[]>(initialItems);
  const [activeMenu, setActiveMenu] = useState<NavMenu>("HEADER");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentMenuItems = items
    .filter((it) => it.menu === activeMenu)
    .sort((a, b) => a.order - b.order);

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const menuList = [...currentMenuItems];
    const temp = menuList[idx - 1];
    menuList[idx - 1] = menuList[idx];
    menuList[idx] = temp;

    // re-assign order
    const updated = menuList.map((it, i) => ({ ...it, order: i }));
    const otherItems = items.filter((it) => it.menu !== activeMenu);
    setItems([...otherItems, ...updated]);
  };

  const moveDown = (idx: number) => {
    if (idx === currentMenuItems.length - 1) return;
    const menuList = [...currentMenuItems];
    const temp = menuList[idx + 1];
    menuList[idx + 1] = menuList[idx];
    menuList[idx] = temp;

    const updated = menuList.map((it, i) => ({ ...it, order: i }));
    const otherItems = items.filter((it) => it.menu !== activeMenu);
    setItems([...otherItems, ...updated]);
  };

  const addItem = () => {
    const newItem: NavItemRecord = {
      menu: activeMenu,
      label: "New Link",
      href: "/",
      order: currentMenuItems.length,
      isExternal: false,
      published: true,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (idx: number, patch: Partial<NavItemRecord>) => {
    const target = currentMenuItems[idx];
    const updated = items.map((it) => (it === target ? { ...it, ...patch } : it));
    setItems(updated);
  };

  const removeItem = (idx: number) => {
    const target = currentMenuItems[idx];
    const remaining = items.filter((it) => it !== target);
    setItems(remaining);
  };

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await saveNavItems(activeMenu, currentMenuItems);
      if (res.success) {
        setMessage({ type: "success", text: `Navigation menu saved successfully!` });
      } else {
        setMessage({ type: "error", text: res.error || "Failed to save navigation" });
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading">Navigation & Menus</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure header navigation and footer link columns.
          </p>
        </div>

        <Button
          disabled={isPending}
          onClick={handleSave}
          className="rounded-xl bg-brand-primary hover:bg-brand-primary-hover shadow-md font-semibold"
        >
          <Save className="mr-2 size-4" />
          <span>Save Menu</span>
        </Button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
              : "bg-destructive/10 border-destructive/30 text-destructive"
          }`}
        >
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage(null)} className="text-xs font-semibold underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      <Tabs value={activeMenu} onValueChange={(val) => setActiveMenu(val as NavMenu)}>
        <TabsList className="bg-muted/60 p-1 rounded-xl">
          <TabsTrigger value="HEADER" className="rounded-lg">Header Nav</TabsTrigger>
          <TabsTrigger value="FOOTER_COL1" className="rounded-lg">Footer Col 1 (Explore)</TabsTrigger>
          <TabsTrigger value="FOOTER_COL2" className="rounded-lg">Footer Col 2 (Get Involved)</TabsTrigger>
          <TabsTrigger value="FOOTER_LEGAL" className="rounded-lg">Footer Legal</TabsTrigger>
        </TabsList>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">
              {currentMenuItems.length} links configured
            </span>
            <Button onClick={addItem} size="sm" className="rounded-xl bg-brand-primary hover:bg-brand-primary-hover">
              <Plus className="mr-1.5 size-4" />
              <span>Add Link</span>
            </Button>
          </div>

          {currentMenuItems.length === 0 ? (
            <Card className="rounded-2xl border-dashed p-10 text-center text-muted-foreground">
              No items in this menu. Click &ldquo;Add Link&rdquo; to configure.
            </Card>
          ) : (
            <div className="space-y-3">
              {currentMenuItems.map((item, idx) => (
                <Card key={idx} className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={idx === 0}
                        onClick={() => moveUp(idx)}
                        className="size-7 rounded-md"
                      >
                        <ArrowUp className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={idx === currentMenuItems.length - 1}
                        onClick={() => moveDown(idx)}
                        className="size-7 rounded-md"
                      >
                        <ArrowDown className="size-3.5" />
                      </Button>
                      <span className="text-xs font-bold text-muted-foreground size-6 rounded-md bg-muted flex items-center justify-center">
                        {idx + 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                      <div>
                        <Label className="text-xs">Link Label</Label>
                        <Input
                          value={item.label}
                          onChange={(e) => updateItem(idx, { label: e.target.value })}
                          className="h-9 rounded-lg"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">URL / Destination</Label>
                        <Input
                          value={item.href}
                          onChange={(e) => updateItem(idx, { href: e.target.value })}
                          className="h-9 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="flex items-center gap-1.5">
                        <Label className="text-xs text-muted-foreground">External</Label>
                        <Switch
                          checked={item.isExternal}
                          onCheckedChange={(val) => updateItem(idx, { isExternal: val })}
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Label className="text-xs text-muted-foreground">Active</Label>
                        <Switch
                          checked={item.published}
                          onCheckedChange={(val) => updateItem(idx, { published: val })}
                        />
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(idx)}
                        className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
