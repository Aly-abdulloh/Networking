"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../components/auth-provider";
import { DetailRow } from "../../../../components/detail-row";
import { ErrorCard, PageLoading } from "../../../../components/page-feedback";
import { OrderBadge } from "../../../../components/status-badge";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui";
import { api } from "../../../../lib/api";
import { formatDate, formatSom } from "../../../../lib/utils";

export default function MyOrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user.role !== "customer") {
      router.replace("/");
      return;
    }
    api.getMyOrder(id).then(setOrder).catch((value) => setError(value.message));
  }, [id, user.role, router]);

  if (user.role !== "customer") return null;
  if (error) return <div className="page-container"><ErrorCard message={error} /></div>;
  if (!order) return <div className="page-container"><PageLoading /></div>;

  return (
    <div className="page-container">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2">
          <Link href="/my-orders"><ArrowLeft className="h-4 w-4" />Buyurtmalarimga qaytish</Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="page-title">Buyurtma #{order._id.slice(-6).toUpperCase()}</h1>
          <OrderBadge status={order.status} />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Ma'lumotlar</CardTitle></CardHeader>
          <CardContent>
            <dl>
              <DetailRow label="Buyurtma sanasi" value={formatDate(order.createdAt)} />
              <DetailRow label="Jami summa" value={formatSom(order.total)} />
              <DetailRow label="Mahsulotlar soni" value={`${order.items.reduce((sum, item) => sum + item.quantity, 0)} dona`} />
            </dl>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Mahsulotlar</CardTitle></CardHeader>
          <CardContent className="px-0">
            <div className="table-wrap">
              <table className="data-table min-w-[520px]">
                <thead><tr><th>Mahsulot</th><th>Narx</th><th>Miqdor</th><th>Jami</th></tr></thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.product}>
                      <td><p className="font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.sku}</p></td>
                      <td>{formatSom(item.unitPrice)}</td>
                      <td>{item.quantity} dona</td>
                      <td className="font-medium">{formatSom(item.unitPrice * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
