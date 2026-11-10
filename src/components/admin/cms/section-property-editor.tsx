"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Image from "next/image";
import {
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { CmsSection } from "@/lib/cms-types";
import { MediaPickerDialog } from "./media-picker-dialog";

interface SectionPropertyEditorProps {
  section: CmsSection;
  onChange: (updated: CmsSection) => void;
}

export function SectionPropertyEditor({ section, onChange }: SectionPropertyEditorProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{ path: string; altPath?: string } | null>(null);

  const props = (section.props || {}) as Record<string, any>;

  const updateProp = (key: string, value: any) => {
    onChange({
      ...section,
      props: {
        ...props,
        [key]: value,
      } as unknown as typeof section.props,
    });
  };

  const openPickerFor = (path: string, altPath?: string) => {
    setPickerTarget({ path, altPath });
    setPickerOpen(true);
  };

  const handleMediaSelect = (url: string, altText?: string) => {
    if (!pickerTarget) return;

    if (pickerTarget.path.includes(".")) {
      const [parent, child] = pickerTarget.path.split(".");
      const parentObj = { ...(props[parent] || {}) };
      parentObj[child] = url;
      updateProp(parent, parentObj);
    } else {
      updateProp(pickerTarget.path, url);
    }

    if (pickerTarget.altPath && altText) {
      updateProp(pickerTarget.altPath, altText);
    }
  };

  return (
    <div className="space-y-6 py-2">
      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleMediaSelect}
      />

      {/* 1. HERO SECTION */}
      {section.type === "hero" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Badge Text (Optional)</Label>
            <Input
              value={props.badge || ""}
              onChange={(e) => updateProp("badge", e.target.value)}
              placeholder="e.g. Hope for Vulnerable Children in Ghana"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Main Title / Headline</Label>
            <Input
              value={props.title || ""}
              onChange={(e) => updateProp("title", e.target.value)}
              placeholder="e.g. Transforming Lives Through Love & Education"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Subtitle / Narrative</Label>
            <Textarea
              rows={3}
              value={props.subtitle || ""}
              onChange={(e) => updateProp("subtitle", e.target.value)}
              placeholder="Brief sentence describing the mission..."
            />
          </div>

          {/* Background Image Picker */}
          <div className="space-y-2">
            <Label>Background Photo</Label>
            <div className="flex items-center gap-4">
              {props.imageUrl ? (
                <div className="relative size-20 rounded-xl overflow-hidden border bg-muted shrink-0">
                  <Image src={props.imageUrl} alt="" fill className="object-cover" />
                </div>
              ) : (
                <div className="size-20 rounded-xl border border-dashed flex items-center justify-center bg-muted text-muted-foreground shrink-0">
                  <ImageIcon className="size-6" />
                </div>
              )}
              <div className="space-y-1.5 flex-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openPickerFor("imageUrl")}
                  className="rounded-xl text-xs"
                >
                  <Upload className="mr-1.5 size-3.5 text-brand-primary" />
                  <span>Choose from Media Library</span>
                </Button>
                <Input
                  value={props.imageUrl || ""}
                  onChange={(e) => updateProp("imageUrl", e.target.value)}
                  placeholder="Or enter direct image URL..."
                  className="text-xs h-8"
                />
              </div>
            </div>
          </div>

          {/* Layout Alignment */}
          <div className="space-y-1.5">
            <Label>Text Alignment</Label>
            <select
              value={props.alignment || "center"}
              onChange={(e) => updateProp("alignment", e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="center">Center Aligned</option>
              <option value="left">Left Aligned</option>
            </select>
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
            <div className="space-y-2">
              <Label className="font-semibold text-xs uppercase text-muted-foreground">Primary Button</Label>
              <Input
                value={props.primaryCta?.label || ""}
                onChange={(e) =>
                  updateProp("primaryCta", { ...(props.primaryCta || {}), label: e.target.value })
                }
                placeholder="Label (e.g. Sponsor a Child)"
              />
              <Input
                value={props.primaryCta?.href || ""}
                onChange={(e) =>
                  updateProp("primaryCta", { ...(props.primaryCta || {}), href: e.target.value })
                }
                placeholder="Destination URL (e.g. /sponsor-a-child)"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-xs uppercase text-muted-foreground">Secondary Button</Label>
              <Input
                value={props.secondaryCta?.label || ""}
                onChange={(e) =>
                  updateProp("secondaryCta", { ...(props.secondaryCta || {}), label: e.target.value })
                }
                placeholder="Label (e.g. Make a Donation)"
              />
              <Input
                value={props.secondaryCta?.href || ""}
                onChange={(e) =>
                  updateProp("secondaryCta", { ...(props.secondaryCta || {}), href: e.target.value })
                }
                placeholder="Destination URL (e.g. /donate)"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. RICH TEXT SECTION */}
      {section.type === "rich_text" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Heading (Optional)</Label>
            <Input
              value={props.heading || ""}
              onChange={(e) => updateProp("heading", e.target.value)}
              placeholder="e.g. Our Guiding Mission"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Subheading (Optional)</Label>
            <Input
              value={props.subheading || ""}
              onChange={(e) => updateProp("subheading", e.target.value)}
              placeholder="Brief descriptive tagline..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Body Content Narrative</Label>
            <Textarea
              rows={6}
              value={props.content || ""}
              onChange={(e) => updateProp("content", e.target.value)}
              placeholder="Enter narrative text. Separate paragraphs with double newlines."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Container Width</Label>
              <select
                value={props.containerWidth || "default"}
                onChange={(e) => updateProp("containerWidth", e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="narrow">Narrow (Centered readable text)</option>
                <option value="default">Default Width</option>
                <option value="wide">Wide Width</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Background Tone</Label>
              <select
                value={props.backgroundColor || "white"}
                onChange={(e) => updateProp("backgroundColor", e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="white">Clean White / Surface</option>
                <option value="muted">Soft Muted Gray</option>
                <option value="brand">Deep Brand Forest (High Contrast)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 3. IMAGE & TEXT SECTION */}
      {section.type === "image_text" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Heading</Label>
            <Input
              value={props.heading || ""}
              onChange={(e) => updateProp("heading", e.target.value)}
              placeholder="e.g. The Urgency of Our Mission"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Lead Highlight Sentence</Label>
            <Input
              value={props.lead || ""}
              onChange={(e) => updateProp("lead", e.target.value)}
              placeholder="e.g. Hundreds of children in Accra survive without safe shelter."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Paragraphs (One per line)</Label>
            <Textarea
              rows={4}
              value={Array.isArray(props.paragraphs) ? props.paragraphs.join("\n\n") : ""}
              onChange={(e) =>
                updateProp(
                  "paragraphs",
                  e.target.value.split("\n\n").filter((p) => p.trim().length > 0)
                )
              }
              placeholder="Paragraph 1&#10;&#10;Paragraph 2"
            />
          </div>

          {/* Photo Selection */}
          <div className="space-y-2">
            <Label>Photograph</Label>
            <div className="flex items-center gap-4">
              {props.imageUrl ? (
                <div className="relative size-20 rounded-xl overflow-hidden border bg-muted shrink-0">
                  <Image src={props.imageUrl} alt="" fill className="object-cover" />
                </div>
              ) : (
                <div className="size-20 rounded-xl border border-dashed flex items-center justify-center bg-muted text-muted-foreground shrink-0">
                  <ImageIcon className="size-6" />
                </div>
              )}
              <div className="space-y-1.5 flex-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openPickerFor("imageUrl", "imageAlt")}
                  className="rounded-xl text-xs"
                >
                  <Upload className="mr-1.5 size-3.5 text-brand-primary" />
                  <span>Choose from Media Library</span>
                </Button>
                <Input
                  value={props.imageAlt || ""}
                  onChange={(e) => updateProp("imageAlt", e.target.value)}
                  placeholder="Image description (Alt Text)"
                  className="text-xs h-8"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Image Placement</Label>
            <select
              value={props.imagePosition || "right"}
              onChange={(e) => updateProp("imagePosition", e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="right">Image on Right, Text on Left</option>
              <option value="left">Image on Left, Text on Right</option>
            </select>
          </div>

          {/* Bullet Points */}
          <div className="space-y-2 pt-2 border-t">
            <Label className="font-semibold text-xs uppercase text-muted-foreground">Key Takeaways (Bullet Points)</Label>
            <Textarea
              rows={3}
              value={Array.isArray(props.bulletPoints) ? props.bulletPoints.join("\n") : ""}
              onChange={(e) =>
                updateProp(
                  "bulletPoints",
                  e.target.value.split("\n").filter((b) => b.trim().length > 0)
                )
              }
              placeholder="Point 1&#10;Point 2&#10;Point 3"
            />
          </div>
        </div>
      )}

      {/* 4. CARD GRID SECTION */}
      {section.type === "card_grid" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Heading</Label>
            <Input
              value={props.heading || ""}
              onChange={(e) => updateProp("heading", e.target.value)}
              placeholder="e.g. How Your Support Changes Everything"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Subheading (Optional)</Label>
            <Input
              value={props.subheading || ""}
              onChange={(e) => updateProp("subheading", e.target.value)}
              placeholder="Brief subtitle..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Grid Columns</Label>
            <select
              value={props.columns || 3}
              onChange={(e) => updateProp("columns", Number(e.target.value))}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            >
              <option value={2}>2 Columns</option>
              <option value={3}>3 Columns (Recommended)</option>
              <option value={4}>4 Columns</option>
            </select>
          </div>

          {/* Cards List Editor */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-xs uppercase text-muted-foreground">
                Cards ({Array.isArray(props.cards) ? props.cards.length : 0})
              </Label>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  const currentCards = Array.isArray(props.cards) ? props.cards : [];
                  updateProp("cards", [
                    ...currentCards,
                    { title: "New Card", description: "Card description text", icon: "Sparkles" },
                  ]);
                }}
                className="rounded-xl text-xs h-7 bg-brand-primary hover:bg-brand-primary-hover"
              >
                <Plus className="mr-1 size-3" />
                <span>Add Card</span>
              </Button>
            </div>

            {Array.isArray(props.cards) &&
              (props.cards as any[]).map((card: any, idx: number) => (
                <Card key={idx} className="p-3 rounded-xl border border-border/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground">Card #{idx + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        updateProp(
                          "cards",
                          (props.cards as any[]).filter((_: any, i: number) => i !== idx)
                        );
                      }}
                      className="size-6 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      value={String(card.title || "")}
                      onChange={(e) => {
                        const updated = [...(props.cards as Record<string, unknown>[])];
                        updated[idx].title = e.target.value;
                        updateProp("cards", updated);
                      }}
                      placeholder="Title"
                      className="text-xs h-8"
                    />
                    <select
                      value={card.icon || "Sparkles"}
                      onChange={(e) => {
                        const updated = [...props.cards];
                        updated[idx].icon = e.target.value;
                        updateProp("cards", updated);
                      }}
                      className="rounded-xl border border-input bg-background px-2 py-1 text-xs h-8"
                    >
                      <option value="GraduationCap">GraduationCap (Education)</option>
                      <option value="HeartHandshake">HeartHandshake (Care/Community)</option>
                      <option value="Hammer">Hammer (Vocational Skills)</option>
                      <option value="Heart">Heart (Faith/Love)</option>
                      <option value="ShieldCheck">ShieldCheck (Diligence/Safety)</option>
                      <option value="Users">Users (Collaboration)</option>
                      <option value="Flame">Flame (Passion)</option>
                      <option value="Clock">Clock (Dependability)</option>
                      <option value="Sparkles">Sparkles (General)</option>
                    </select>
                  </div>

                  <Textarea
                    rows={2}
                    value={card.description || ""}
                    onChange={(e) => {
                      const updated = [...props.cards];
                      updated[idx].description = e.target.value;
                      updateProp("cards", updated);
                    }}
                    placeholder="Description text..."
                    className="text-xs"
                  />
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* 5. IMPACT STATS SECTION */}
      {section.type === "impact_stats" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Heading</Label>
            <Input
              value={props.heading || ""}
              onChange={(e) => updateProp("heading", e.target.value)}
              placeholder="e.g. Our Collective Impact to Date"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Subheading (Optional)</Label>
            <Input
              value={props.subheading || ""}
              onChange={(e) => updateProp("subheading", e.target.value)}
              placeholder="e.g. Real, audited outcomes from Ghana"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
            <div>
              <Label className="font-semibold text-sm">Use Live Database Metrics</Label>
              <p className="text-xs text-muted-foreground">
                Automatically calculates total funds raised and active sponsorships directly from database.
              </p>
            </div>
            <Switch
              checked={props.useLiveDatabase !== false}
              onCheckedChange={(checked) => updateProp("useLiveDatabase", checked)}
            />
          </div>
        </div>
      )}

      {/* 6. FEATURED CHILDREN SECTION */}
      {section.type === "featured_children" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Heading</Label>
            <Input
              value={props.heading || ""}
              onChange={(e) => updateProp("heading", e.target.value)}
              placeholder="e.g. Children Awaiting a Brightener"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Subheading</Label>
            <Input
              value={props.subheading || ""}
              onChange={(e) => updateProp("subheading", e.target.value)}
              placeholder="e.g. Meet the boys and girls who need your support today"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Selection Mode</Label>
              <select
                value={props.mode || "auto_urgent"}
                onChange={(e) => updateProp("mode", e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="auto_urgent">Auto Urgent (Priority Children First)</option>
                <option value="manual">Manual Selection</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Maximum Cards to Display</Label>
              <select
                value={props.maxCount || 3}
                onChange={(e) => updateProp("maxCount", Number(e.target.value))}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              >
                <option value={3}>3 Children</option>
                <option value={6}>6 Children</option>
                <option value={9}>9 Children</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 7. PROGRAMMES SECTION */}
      {section.type === "programmes" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Heading</Label>
            <Input
              value={props.heading || ""}
              onChange={(e) => updateProp("heading", e.target.value)}
              placeholder="e.g. Our Primary Programmes"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Subheading</Label>
            <Input
              value={props.subheading || ""}
              onChange={(e) => updateProp("subheading", e.target.value)}
              placeholder="e.g. Structured pathways from street to self-sufficiency"
            />
          </div>

          {/* Programmes List */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-xs uppercase text-muted-foreground">
                Programmes ({Array.isArray(props.programmes) ? props.programmes.length : 0})
              </Label>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  const current = Array.isArray(props.programmes) ? props.programmes : [];
                  updateProp("programmes", [
                    ...current,
                    {
                      title: "New Programme",
                      category: "Education",
                      description: "Programme details",
                      metrics: "100+ served",
                    },
                  ]);
                }}
                className="rounded-xl text-xs h-7 bg-brand-primary hover:bg-brand-primary-hover"
              >
                <Plus className="mr-1 size-3" />
                <span>Add Programme</span>
              </Button>
            </div>

            {Array.isArray(props.programmes) &&
              (props.programmes as any[]).map((prog: any, idx: number) => (
                <Card key={idx} className="p-3 rounded-xl border border-border/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground">Programme #{idx + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        updateProp(
                          "programmes",
                          (props.programmes as any[]).filter((_: any, i: number) => i !== idx)
                        );
                      }}
                      className="size-6 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={String(prog.title || "")}
                      onChange={(e) => {
                        const updated = [...(props.programmes as Record<string, unknown>[])];
                        updated[idx].title = e.target.value;
                        updateProp("programmes", updated);
                      }}
                      placeholder="Title"
                      className="text-xs h-8"
                    />
                    <Input
                      value={prog.category || ""}
                      onChange={(e) => {
                        const updated = [...props.programmes];
                        updated[idx].category = e.target.value;
                        updateProp("programmes", updated);
                      }}
                      placeholder="Category (e.g. Education)"
                      className="text-xs h-8"
                    />
                  </div>

                  <Textarea
                    rows={2}
                    value={prog.description || ""}
                    onChange={(e) => {
                      const updated = [...props.programmes];
                      updated[idx].description = e.target.value;
                      updateProp("programmes", updated);
                    }}
                    placeholder="Description text..."
                    className="text-xs"
                  />

                  <Input
                    value={prog.metrics || ""}
                    onChange={(e) => {
                      const updated = [...props.programmes];
                      updated[idx].metrics = e.target.value;
                      updateProp("programmes", updated);
                    }}
                    placeholder="Metric badge (e.g. Over 600 children engaged annually)"
                    className="text-xs h-8"
                  />
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* 8. DONATION CTA SECTION */}
      {section.type === "donation_cta" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Heading</Label>
            <Input
              value={props.heading || ""}
              onChange={(e) => updateProp("heading", e.target.value)}
              placeholder="e.g. Every Child Deserves a Chance to Learn"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Subheading</Label>
            <Input
              value={props.subheading || ""}
              onChange={(e) => updateProp("subheading", e.target.value)}
              placeholder="e.g. Your gift directly funds education and security in Ghana"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Button Label</Label>
            <Input
              value={props.primaryCtaLabel || "Donate Now"}
              onChange={(e) => updateProp("primaryCtaLabel", e.target.value)}
              placeholder="Donate Now"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Preset Dollar Amounts (Comma separated)</Label>
            <Input
              value={Array.isArray(props.presetAmounts) ? props.presetAmounts.join(", ") : "25, 50, 100, 250"}
              onChange={(e) => {
                const amounts = e.target.value
                  .split(",")
                  .map((s) => Number(s.trim()))
                  .filter((n) => !isNaN(n) && n > 0);
                updateProp("presetAmounts", amounts);
              }}
              placeholder="25, 50, 100, 250"
            />
          </div>
        </div>
      )}

      {/* 9. PARTNERSHIP CTA SECTION */}
      {section.type === "partnership_cta" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Heading</Label>
            <Input
              value={props.heading || ""}
              onChange={(e) => updateProp("heading", e.target.value)}
              placeholder="e.g. Become a Brightener Partner"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Subheading</Label>
            <Input
              value={props.subheading || ""}
              onChange={(e) => updateProp("subheading", e.target.value)}
              placeholder="Subtitle text..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Button Label</Label>
              <Input
                value={props.buttonLabel || "Explore Partnerships"}
                onChange={(e) => updateProp("buttonLabel", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Button Destination URL</Label>
              <Input
                value={props.buttonUrl || "/become-a-brightener"}
                onChange={(e) => updateProp("buttonUrl", e.target.value)}
              />
            </div>
          </div>

          {/* Background Image */}
          <div className="space-y-2 pt-2 border-t">
            <Label>Background Photo</Label>
            <div className="flex items-center gap-4">
              {props.backgroundImageUrl ? (
                <div className="relative size-16 rounded-xl overflow-hidden border bg-muted shrink-0">
                  <Image src={props.backgroundImageUrl} alt="" fill className="object-cover" />
                </div>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => openPickerFor("backgroundImageUrl")}
                className="rounded-xl text-xs"
              >
                <Upload className="mr-1.5 size-3.5 text-brand-primary" />
                <span>Choose Background Image</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 10. FAQ SECTION */}
      {section.type === "faq" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Heading</Label>
            <Input
              value={props.heading || ""}
              onChange={(e) => updateProp("heading", e.target.value)}
              placeholder="Frequently Asked Questions"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Subheading</Label>
            <Input
              value={props.subheading || ""}
              onChange={(e) => updateProp("subheading", e.target.value)}
              placeholder="Everything you need to know..."
            />
          </div>

          {/* Items */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-xs uppercase text-muted-foreground">
                Questions ({Array.isArray(props.items) ? props.items.length : 0})
              </Label>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  const current = Array.isArray(props.items) ? props.items : [];
                  updateProp("items", [
                    ...current,
                    { question: "New Question?", answer: "Answer description." },
                  ]);
                }}
                className="rounded-xl text-xs h-7 bg-brand-primary hover:bg-brand-primary-hover"
              >
                <Plus className="mr-1 size-3" />
                <span>Add Question</span>
              </Button>
            </div>

            {Array.isArray(props.items) &&
              (props.items as any[]).map((item: any, idx: number) => (
                <Card key={idx} className="p-3 rounded-xl border border-border/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground">FAQ #{idx + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        updateProp(
                          "items",
                          (props.items as any[]).filter((_: any, i: number) => i !== idx)
                        );
                      }}
                      className="size-6 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>

                  <Input
                    value={String(item.question || "")}
                    onChange={(e) => {
                      const updated = [...(props.items as Record<string, unknown>[])];
                      updated[idx].question = e.target.value;
                      updateProp("items", updated);
                    }}
                    placeholder="Question..."
                    className="text-xs h-8 font-semibold"
                  />

                  <Textarea
                    rows={3}
                    value={item.answer || ""}
                    onChange={(e) => {
                      const updated = [...props.items];
                      updated[idx].answer = e.target.value;
                      updateProp("items", updated);
                    }}
                    placeholder="Answer narrative..."
                    className="text-xs"
                  />
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* 11. CONTACT INFO SECTION */}
      {section.type === "contact_info" && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Heading</Label>
            <Input
              value={props.heading || ""}
              onChange={(e) => updateProp("heading", e.target.value)}
              placeholder="Get in Touch with LivingHope"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Office Address</Label>
            <Input
              value={props.address || ""}
              onChange={(e) => updateProp("address", e.target.value)}
              placeholder="Accra, Greater Accra Region, Ghana"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Telephone Number</Label>
              <Input
                value={props.phone || ""}
                onChange={(e) => updateProp("phone", e.target.value)}
                placeholder="+233 24 000 0000"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Official Email</Label>
              <Input
                value={props.email || ""}
                onChange={(e) => updateProp("email", e.target.value)}
                placeholder="info@livinghope.org"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Operating Hours</Label>
            <Input
              value={props.hours || ""}
              onChange={(e) => updateProp("hours", e.target.value)}
              placeholder="Mon - Fri: 8:00 AM - 5:00 PM GMT"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Google Maps Embed URL</Label>
            <Input
              value={props.mapEmbedUrl || ""}
              onChange={(e) => updateProp("mapEmbedUrl", e.target.value)}
              placeholder="https://maps.google.com/..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
