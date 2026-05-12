"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProjectAction } from "@/lib/actions/projects";

export function CreateProjectDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const router = useRouter();

  function onSubmit(formData: FormData) {
    setErrors({});
    startTransition(async () => {
      const result = await createProjectAction(formData);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }
      toast.success("Project created");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Track tasks, milestones, and a timeline.</DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <Field label="Name" name="name" error={errors.name?.[0]} required />
          <Field
            label="Description"
            name="description"
            error={errors.description?.[0]}
            textarea
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Start date"
              name="startDate"
              type="date"
              error={errors.startDate?.[0]}
            />
            <Field
              label="End date"
              name="endDate"
              type="date"
              error={errors.endDate?.[0]}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  name,
  type = "text",
  error,
  required,
  textarea,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      {textarea ? (
        <Textarea id={name} name={name} rows={3} />
      ) : (
        <Input id={name} name={name} type={type} required={required} />
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
