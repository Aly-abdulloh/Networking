import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui";

export function Pagination({ pagination, onPage }) {
  if (!pagination || pagination.pages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t px-4 py-3">
      <p className="text-sm text-muted-foreground">
        {pagination.total} ta natija · {pagination.page}/{pagination.pages} sahifa
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          disabled={pagination.page <= 1}
          onClick={() => onPage(pagination.page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          disabled={pagination.page >= pagination.pages}
          onClick={() => onPage(pagination.page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
