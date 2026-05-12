"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteProjectAction } from "@/lib/actions/projects";

export function DeleteProjectButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this project and all its tasks/milestones?")) return;
        startTransition(async () => {
          try {
            await deleteProjectAction(id);
          } catch (error) {
            // redirect() throws a control-flow exception; ignore it
            if (error instanceof Error && error.message === "NEXT_REDIRECT") return;
            toast.error("Failed to delete project");
          }
        });
      }}
    >
      <Trash2 className="size-4" />
      Delete
    </Button>
  );
}
