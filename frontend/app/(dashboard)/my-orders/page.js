"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../components/auth-provider";
import { EmptyState, ErrorCard } from "../../../components/page-feedback";
import { Pagination } from "../../../components/pagination";
import { OrderBadge } from "../../../components/status-badge";
import { Button, Card, Skeleton } from "../../../components/ui";
import { api } from "../../../lib/api";
import { formatDate, formatSom } from "../../../lib/utils";

export default function MyOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState({ items: [], pagination: null });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (user.role !== "customer") return;
    setLoading(true);
    try {
      setData(await api.getMyOrders(`?page=${page}&limit=10`));
      setError("");
    } catch (value) {
      setError(value.message);
    } finally {
      setLoading(false);
    }
  }, [page, user.role]);

  useEffect(() => {
    if (user.role !== "customer") router.replace("/");
    else load();
  }, [user.role, router, load]);

  if (user.role !== "customer") return null;

  return (
    <div className="page-container">
      <div>
        <h1 className="page-title">Buyurtmalarim</h1>
        <p className="page-description">Sizga tegishli barcha buyurtmalar</p>
      </div>
      {error && <ErrorCard message={error} />}
      <Card>
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}
          </div>
        ) : data.items.length === 0 ? (
          <EmptyState title="Buyurtmalar mavjud emas" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Buyurtma</th><th>Sana</th><th>Mahsulotlar</th><th>Summa</th><th>Holat</th><th></th></tr></thead>
              <tbody>
                {data.items.map((order) => (
                  <tr key={order._id}>
                    <td className="font-medium">#{order._id.slice(-6).toUpperCase()}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)} dona</td>
                    <td className="font-medium">{formatSom(order.total)}</td>
                    <td><OrderBadge status={order.status} /></td>
                    <td className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link
                          href={`/my-orders/${order._id}`}
                          aria-label="Buyurtma ma'lumotlarini ko'rish"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={data.pagination} onPage={setPage} />
      </Card>
    </div>
  );
}
