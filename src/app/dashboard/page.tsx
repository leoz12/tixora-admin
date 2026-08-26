"use client";

import Link from "next/link";
import { CalendarDays, Tags, Receipt, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useEvents } from "@/lib/queries/events";
import { useCategories } from "@/lib/queries/categories";
import { useOrders } from "@/lib/queries/orders";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from "@/lib/constants";
import { formatDate, formatRupiah } from "@/lib/utils";

export default function DashboardPage() {
  const { admin } = useAdminAuth();
  const { data: events, isLoading: loadingEvents } = useEvents({ page: 1 });
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { data: orders, isLoading: loadingOrders } = useOrders({ page: 1 });

  const stats = [
    {
      label: "Total events",
      value: events?.total,
      icon: CalendarDays,
      href: "/dashboard/events",
      loading: loadingEvents,
    },
    {
      label: "Categories",
      value: categories?.length,
      icon: Tags,
      href: "/dashboard/categories",
      loading: loadingCategories,
    },
    {
      label: "Total orders",
      value: orders?.total,
      icon: Receipt,
      href: "/dashboard/orders",
      loading: loadingOrders,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Welcome back{admin?.name ? `, ${admin.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your events today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="border-border transition-colors hover:border-primary/40">
              <CardContent className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  {stat.loading ? (
                    <Skeleton className="mt-1.5 h-7 w-12" />
                  ) : (
                    <p className="mt-0.5 text-2xl font-semibold tabular-nums">
                      {stat.value ?? 0}
                    </p>
                  )}
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <stat.icon className="h-4 w-4" strokeWidth={2} />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="border-border">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Recent orders</h2>
          <Link
            href="/dashboard/orders"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <CardContent className="p-0">
          {loadingOrders && (
            <div className="flex flex-col gap-3 p-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          )}

          {!loadingOrders && (orders?.items?.length ?? 0) === 0 && (
            <p className="p-5 text-sm text-muted-foreground">No orders yet.</p>
          )}

          {!loadingOrders && orders?.items && orders.items.length > 0 && (
            <ul className="divide-y divide-border">
              {orders.items.slice(0, 5).map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{order.buyer_name}</p>
                    <p className="truncate text-muted-foreground">{order.event_title}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="tabular-nums text-muted-foreground">
                      {formatDate(order.created_at)}
                    </span>
                    <span className="tabular-nums font-medium">
                      {formatRupiah(order.total_price)}
                    </span>
                    <Badge className={ORDER_STATUS_BADGE[order.status]}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
