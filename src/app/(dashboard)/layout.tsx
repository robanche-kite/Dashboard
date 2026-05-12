import Link from "next/link";
import type { ReactNode } from "react";
import { LayoutDashboard, FolderKanban, CalendarRange } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1">
      <aside className="hidden w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <LayoutDashboard className="size-5" />
          <span className="text-base font-semibold">Dashboard</span>
        </div>
        <nav className="flex flex-col gap-1 p-2">
          <NavItem href="/projects" icon={<FolderKanban className="size-4" />}>
            Projects
          </NavItem>
          <NavItem href="/timeline" icon={<CalendarRange className="size-4" />}>
            Timeline
          </NavItem>
        </nav>
      </aside>
      <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
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
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      {icon}
      {children}
    </Link>
  );
}
