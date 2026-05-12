import Link from "next/link";
import type { ReactNode } from "react";
import {
  FolderKanban,
  CalendarRange,
  Sparkles,
} from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:flex md:flex-col">
        <div className="flex h-16 items-center gap-3 px-5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15">
            <Sparkles className="size-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-base font-semibold text-foreground">Dashboard</span>
            <p className="text-[11px] leading-tight text-muted-foreground">Project Manager</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-3 pt-4">
          <p className="mb-1 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Menu
          </p>
          <NavItem href="/projects" icon={<FolderKanban className="size-[18px]" />}>
            Projects
          </NavItem>
          <NavItem href="/timeline" icon={<CalendarRange className="size-[18px]" />}>
            Timeline
          </NavItem>
        </nav>

        <div className="mt-auto border-t border-sidebar-border p-4">
          <div className="rounded-xl bg-emerald-500/10 p-3">
            <p className="text-xs font-medium text-emerald-600">Tip</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Add tasks with start &amp; due dates to see them on the timeline.
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 lg:px-12">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      <span className="text-muted-foreground transition-colors group-hover:text-emerald-600">
        {icon}
      </span>
      {children}
    </Link>
  );
}
