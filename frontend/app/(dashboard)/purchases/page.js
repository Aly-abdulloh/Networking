"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../../components/auth-provider";
import { EmptyState, ErrorCard } from "../../../components/page-feedback";
import { Card, Skeleton } from "../../../components/ui";
import { api } from "../../../lib/api";
import { formatDate, formatSom } from "../../../lib/utils";

export default function PurchasesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user.role !== "customer") {
      router.replace("/");
      return;
    }
    api
      .getPurchases()
      .then(setItems)
      .catch((value) => setError(value.message))
      .finally(() => setLoading(false));
  }, [user.role, router]);

  if (user.role !== "customer") return null;

  return (
    <div className="page-container">
      <div>
        <h1 className="page-title">Mahsulotlarim</h1>
        <p className="page-description">Barcha yakunlangan xaridlaringiz jamlanmasi</p>
      </div>
      {error && <ErrorCard message={error} />}
      <Card>
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState title="Xarid qilingan mahsulotlar yo'q" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Mahsulot</th><th>SKU</th><th>Jami miqdor</th><th>Jami xarajat</th><th>Oxirgi xarid</th></tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id}>
                    <td className="font-medium">{item.name}</td>
                    <td className="text-muted-foreground">{item.sku || "—"}</td>
                    <td>{item.quantity} dona</td>
                    <td className="font-medium">{formatSom(item.spent)}</td>
                    <td>{formatDate(item.lastPurchasedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
