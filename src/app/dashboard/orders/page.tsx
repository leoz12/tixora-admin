import type { Metadata } from "next";
import OrdersTable from "@/components/tables/OrdersTable";

export const metadata: Metadata = {
  title: "Orders — Tixora Admin",
};

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Review orders placed by buyers. Orders are read-only here.
        </p>
      </div>
      <OrdersTable />
    </div>
  );
}
