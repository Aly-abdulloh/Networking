"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DetailRow } from "../../../../components/detail-row";
import { ErrorCard, PageLoading } from "../../../../components/page-feedback";
import { OrderBadge, RoleBadge } from "../../../../components/status-badge";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui";
import { api } from "../../../../lib/api";
import { formatDate, formatSom } from "../../../../lib/utils";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getOrder(id).then(setOrder).catch((value) => setError(value.message));
  }, [id]);

  if (error) return <div className="page-container"><ErrorCard message={error} /></div>;
  if (!order) return <div className="page-container"><PageLoading /></div>;

  return (
    <div className="page-container">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2">
          <Link href="/orders"><ArrowLeft className="h-4 w-4" />Buyurtmalarga qaytish</Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="page-title">Buyurtma #{order._id.slice(-6).toUpperCase()}</h1>
          <OrderBadge status={order.status} />
        </div>
        <p className="page-description">{formatDate(order.createdAt)}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Buyurtma ma'lumotlari</CardTitle></CardHeader>
          <CardContent>
            <dl>
              <DetailRow label="Mijoz" value={order.customer?.company || order.customer?.name} />
              <DetailRow label="Telefon" value={order.customer?.phone} />
              <DetailRow label="Jami summa" value={formatSom(order.total)} />
              <DetailRow label="Qoldiq rezervi" value={order.inventoryReserved ? "Rezerv qilingan" : "Qaytarilgan"} />
              <DetailRow
                label="Yaratgan"
                value={
                  order.createdBy ? (
                    <span className="flex items-center gap-2">
                      {order.createdBy.name}
                      <RoleBadge role={order.createdBy.role} />
                    </span>
                  ) : "Tizim"
                }
              />
            </dl>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Mahsulotlar</CardTitle></CardHeader>
          <CardContent className="px-0">
            <div className="table-wrap">
              <table className="data-table min-w-[560px]">
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
      {order.notes && (
        <Card><CardHeader><CardTitle>Eslatma</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{order.notes}</CardContent></Card>
      )}
    </div>
  );
}
