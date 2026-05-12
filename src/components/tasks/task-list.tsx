"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  taskStatuses,
  taskPriorities,
  type Task,
  type TaskStatus,
} from "@/lib/db/schema";
import {
  createTaskAction,
  deleteTaskAction,
  setTaskStatusAction,
} from "@/lib/actions/tasks";

const statusLabel: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  blocked: "Blocked",
  done: "Done",
};

const statusVariant: Record<TaskStatus, "default" | "secondary" | "outline" | "destructive"> = {
  todo: "outline",
  in_progress: "default",
  blocked: "destructive",
  done: "secondary",
};

export function TaskList({ projectId, tasks }: { projectId: string; tasks: Task[] }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <CreateTaskDialog projectId={projectId} />
      </div>
      {tasks.length === 0 ? (
        <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          No tasks yet. Add one to get started.
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="w-40">Status</TableHead>
                <TableHead className="w-28">Priority</TableHead>
                <TableHead className="w-32">Due</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <TableRow>
      <TableCell className="font-medium">{task.title}</TableCell>
      <TableCell>
        <Select
          value={task.status}
          onValueChange={(value) => {
            if (!value) return;
            startTransition(async () => {
              await setTaskStatusAction(task.id, value);
              router.refresh();
            });
          }}
          disabled={pending}
        >
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {taskStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabel[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Badge variant={statusVariant[task.status]} className="capitalize">
          {task.priority}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{task.dueDate ?? "—"}</TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          disabled={pending}
          onClick={() => {
            if (!confirm("Delete this task?")) return;
            startTransition(async () => {
              await deleteTaskAction(task.id, task.projectId);
              router.refresh();
            });
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function CreateTaskDialog({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  function onSubmit(formData: FormData) {
    setErrors({});
    startTransition(async () => {
      const result = await createTaskAction(formData);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }
      toast.success("Task created");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Plus className="size-4" />
        Add task
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New task</DialogTitle>
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
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue="todo"
                className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
              >
                {taskStatuses.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                name="priority"
                defaultValue="medium"
                className="h-9 w-full rounded-md border bg-transparent px-3 text-sm capitalize"
              >
                {taskPriorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" name="startDate" type="date" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Due date</Label>
              <Input id="dueDate" name="dueDate" type="date" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating…" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
