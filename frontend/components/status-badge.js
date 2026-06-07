import { Badge } from "./ui";
import {
  customerStatuses,
  orderStatuses,
  roleLabels,
} from "../lib/utils";

export function OrderBadge({ status }) {
  const variant =
    status === "cancelled"
      ? "destructive"
      : status === "completed"
        ? "default"
        : "secondary";
  return <Badge variant={variant}>{orderStatuses[status] || status}</Badge>;
}

export function CustomerBadge({ status }) {
  const variant =
    status === "inactive"
      ? "outline"
      : status === "active"
        ? "default"
        : "secondary";
  return <Badge variant={variant}>{customerStatuses[status] || status}</Badge>;
}

export function RoleBadge({ role }) {
  return <Badge variant="outline">{roleLabels[role] || role}</Badge>;
}
