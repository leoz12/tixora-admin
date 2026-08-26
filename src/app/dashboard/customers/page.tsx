import type { Metadata } from "next";
import UsersTable from "@/components/tables/UsersTable";

export const metadata: Metadata = {
  title: "Customers — Tixora Admin",
};

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">
          Browse registered users. Customers are read-only here.
        </p>
      </div>
      <UsersTable />
    </div>
  );
}
