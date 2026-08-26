"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/lib/queries/users";
import { formatDate } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: user, isLoading } = useUser(id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/customers">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to customers</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Customer detail</h1>
          <p className="text-sm text-muted-foreground">Read-only view of this customer.</p>
        </div>
      </div>

      {isLoading && (
        <Card className="max-w-2xl border-border">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && user && (
        <div className="flex max-w-2xl flex-col gap-6">
          <Card className="border-border">
            <CardContent className="flex items-center gap-4 pt-6">
              <Avatar size="lg">
                <AvatarImage src={user.avatar_url} alt={user.name} />
                <AvatarFallback>{initials(user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="pt-6">
              <div className="divide-y divide-border">
                <DetailRow label="Customer ID" value={<span className="font-mono">{user.id}</span>} />
                <DetailRow label="Name" value={user.name} />
                <DetailRow label="Email" value={user.email} />
                <DetailRow label="Joined on" value={formatDate(user.created_at)} />
                <DetailRow label="Last updated" value={formatDate(user.updated_at)} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
