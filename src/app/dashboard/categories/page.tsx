import type { Metadata } from "next";
import CategoriesTable from "@/components/tables/CategoriesTable";

export const metadata: Metadata = {
  title: "Categories — Tixora Admin",
};

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Organize events into categories buyers can browse.
        </p>
      </div>
      <CategoriesTable />
    </div>
  );
}
