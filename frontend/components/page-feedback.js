import { Inbox } from "lucide-react";
import { Card, Skeleton } from "./ui";

export function PageLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}

export function EmptyState({ title = "Ma'lumot topilmadi", description }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-5 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-muted">
        <Inbox className="h-5 w-5 text-muted-foreground" />
      </span>
      <p className="mt-4 text-sm font-medium">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

export function ErrorCard({ message }) {
  return (
    <Card className="border-destructive/40 p-5 text-sm text-destructive">
      {message}
    </Card>
  );
}
