"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DetailRow } from "../../../../components/detail-row";
import { ErrorCard, PageLoading } from "../../../../components/page-feedback";
import { OrderBadge } from "../../../../components/status-badge";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui";
import { api } from "../../../../lib/api";
import { categories, formatDate, formatSom } from "../../../../lib/utils";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getProduct(id).then(setData).catch((value) => setError(value.message));
  }, [id]);

  if (error) {
    return <div className="page-container"><ErrorCard message={error} /></div>;
  }
  if (!data) {
    return <div className="page-container"><PageLoading /></div>;
  }

  const { product, orders } = data;
  const low = product.stock <= product.lowStockThreshold;

  return (
    <div className="page-container">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2">
          <Link href="/products"><ArrowLeft className="h-4 w-4" />Mahsulotlarga qaytish</Link>
        </Button>
        <h1 className="page-title">{product.name}</h1>
        <p className="page-description">{product.sku || "SKU ko'rsatilmagan"}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Mahsulot ma'lumotlari</CardTitle></CardHeader>
          <CardContent>
            <dl>
              <DetailRow label="Kategoriya" value={categories[product.category]} />
              <DetailRow label="O'lcham" value={product.size} />
              <DetailRow label="Narx" value={formatSom(product.price)} />
              <DetailRow
                label="Qoldiq"
                value={<Badge variant={low ? "destructive" : "secondary"}>{product.stock} dona</Badge>}
              />
              <DetailRow label="Ogohlantirish chegarasi" value={`${product.lowStockThreshold} dona`} />
              <DetailRow label="Yaratilgan" value={formatDate(product.createdAt)} />
            </dl>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>So'nggi savdolar</CardTitle></CardHeader>
          <CardContent className="px-0">
            <div className="table-wrap">
              <table className="data-table min-w-[560px]">
                <thead><tr><th>Mijoz</th><th>Sana</th><th>Summa</th><th>Holat</th></tr></thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="font-medium">{order.customer?.company || order.customer?.name || "—"}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>{formatSom(order.total)}</td>
                      <td><OrderBadge status={order.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      {product.description && (
        <Card><CardHeader><CardTitle>Tavsif</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{product.description}</CardContent></Card>
      )}
    </div>
  );
}
