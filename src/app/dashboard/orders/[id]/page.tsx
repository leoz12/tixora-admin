"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useOrder } from "@/lib/queries/orders";
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from "@/lib/constants";
import { formatDate, formatRupiah } from "@/lib/utils";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: order, isLoading } = useOrder(id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/orders">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to orders</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Order detail</h1>
          <p className="text-sm text-muted-foreground">Read-only view of this order.</p>
        </div>
      </div>

      {isLoading && (
        <Card className="max-w-2xl border-border">
          <Skeleton className="h-48 w-full rounded-b-none" />
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && order && (
        <div className="flex max-w-2xl flex-col gap-6">
          <Card className="overflow-hidden border-border">
            {order.event_image && (
              // eslint-disable-next-line @next/next/no-img-element -- CDN image, not worth next/image config for an admin read-only view
              <img
                src={order.event_image}
                alt={order.event_title ?? "Event"}
                className="h-48 w-full object-cover"
              />
            )}
            <CardContent className="flex flex-col gap-3 pt-6">
              <div>
                <h2 className="text-lg font-semibold">{order.event_title ?? "—"}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {order.event_date && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(order.event_date)}
                    </span>
                  )}
                  {order.event_location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {order.event_location}
                    </span>
                  )}
                </div>
              </div>
              {order.event_description && (
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {order.event_description}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="divide-y divide-border">
                <DetailRow label="Order number" value={<span className="font-mono">{order.order_id}</span>} />
                <DetailRow label="Buyer" value={order.buyer_name} />
                <DetailRow label="Email" value={order.buyer_email} />
                <DetailRow label="Quantity" value={order.quantity} />
                <DetailRow label="Unit price" value={formatRupiah(order.unit_price)} />
                <DetailRow label="Subtotal" value={formatRupiah(order.subtotal)} />
                <DetailRow label="Admin fee" value={formatRupiah(order.admin_fee)} />
                <DetailRow label="Total" value={formatRupiah(order.total_price)} />
                <DetailRow label="Payment method" value={order.payment_method || "—"} />
                <DetailRow
                  label="Status"
                  value={
                    <Badge className={ORDER_STATUS_BADGE[order.status]}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </Badge>
                  }
                />
                <DetailRow label="Placed on" value={formatDate(order.created_at)} />
                <DetailRow label="Paid on" value={order.paid_at ? formatDate(order.paid_at) : "—"} />
                <DetailRow label="Expires on" value={order.expires_at ? formatDate(order.expires_at) : "—"} />
                <DetailRow label="Ticket reference" value={order.ticket_reference ?? "—"} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
