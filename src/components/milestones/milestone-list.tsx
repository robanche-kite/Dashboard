"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, Trash2, Flag } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createMilestoneAction,
  deleteMilestoneAction,
  toggleMilestoneAction,
} from "@/lib/actions/milestones";
import type { Milestone } from "@/lib/db/schema";

export function MilestoneList({
  projectId,
  milestones,
}: {
  projectId: string;
  milestones: Milestone[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <CreateMilestoneDialog projectId={projectId} />
      </div>
      {milestones.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 bg-card/50 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">No milestones yet.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {milestones.map((m) => (
            <MilestoneRow key={m.id} milestone={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function MilestoneRow({ milestone }: { milestone: Milestone }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className={`rounded-2xl border p-4 transition-colors ${milestone.reachedAt ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/60 bg-card"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Flag className={`size-4 ${milestone.reachedAt ? "text-emerald-400" : "text-muted-foreground"}`} />
            <span className="font-medium">{milestone.title}</span>
            {milestone.reachedAt && (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                Reached
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{milestone.date}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg text-xs"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await toggleMilestoneAction(milestone.id, milestone.projectId);
                router.refresh();
              })
            }
          >
            <Check className="size-3.5" />
            {milestone.reachedAt ? "Unreach" : "Reached"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-red-400"
            disabled={pending}
            onClick={() => {
              if (!confirm("Delete this milestone?")) return;
              startTransition(async () => {
                await deleteMilestoneAction(milestone.id, milestone.projectId);
                router.refresh();
              });
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function CreateMilestoneDialog({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  function onSubmit(formData: FormData) {
    setErrors({});
    startTransition(async () => {
      const result = await createMilestoneAction(formData);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }
      toast.success("Milestone created");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Plus className="size-4" />
        Add milestone
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New milestone</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <input type="hidden" name="projectId" value={projectId} />
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
            {errors.title?.[0] && (
              <p className="text-xs text-destructive">{errors.title[0]}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" required />
            {errors.date?.[0] && (
              <p className="text-xs text-destructive">{errors.date[0]}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create milestone"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
