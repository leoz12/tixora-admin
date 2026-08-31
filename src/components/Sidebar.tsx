"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Tags, Receipt, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import TixoraMark from "@/components/icons/TixoraMark";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/events", label: "Events", icon: CalendarDays },
  { href: "/dashboard/categories", label: "Categories", icon: Tags },
  { href: "/dashboard/orders", label: "Orders", icon: Receipt },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex h-full w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
        className
      )}
    >
      <div className="flex h-16 items-center gap-2 px-6">
        <span className="flex h-7 w-7 items-center justify-center rounded-md text-primary">
          <TixoraMark size={28} />
        </span>
        <span className="text-[1.05rem] font-semibold tracking-tight">Tixora</span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-sidebar-border px-6 py-4 text-xs text-sidebar-foreground/50">
        Tixora Admin
      </div>
    </nav>
  );
}
