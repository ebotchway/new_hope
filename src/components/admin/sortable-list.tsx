"use client";

import { useState, useTransition, type ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ActionResult } from "@/actions/inquiries";

export function SortableRow({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <tr
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "relative z-10 bg-secondary shadow-md", className)}
    >
      <td className="w-8 pl-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-4" />
        </button>
      </td>
      {children}
    </tr>
  );
}

/**
 * Wraps a whole table (passed as `children`, pre-rendered by a Server Component parent —
 * `SortableRow`s live somewhere inside it) with drag-to-reorder behavior. `ids` and
 * `onReorder` (a Server Action) are the only things that cross the server/client boundary —
 * a `renderRow` function prop can't, since plain functions aren't serializable the way
 * Server Actions are.
 *
 * `DndContext` must wrap here, outside the `<table>`, rather than inside `<tbody>`: it
 * renders real accessibility DOM (hidden instructions + a live region), which is invalid
 * HTML directly inside a `<tbody>`. `SortableContext` is a pure context provider (no DOM
 * of its own), so it can safely sit anywhere in between, wrapping just the rows.
 */
export function SortableListShell({
  ids,
  onReorder,
  children,
}: {
  ids: string[];
  onReorder: (ids: string[]) => Promise<ActionResult>;
  children: ReactNode;
}) {
  const [order, setOrder] = useState(ids);
  const [, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = order.indexOf(String(active.id));
    const newIndex = order.indexOf(String(over.id));
    const next = [...order];
    next.splice(oldIndex, 1);
    next.splice(newIndex, 0, String(active.id));
    setOrder(next);

    startTransition(async () => {
      const result = await onReorder(next);
      if (!result.success) toast.error(result.error);
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}
