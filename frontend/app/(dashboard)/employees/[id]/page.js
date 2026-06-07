"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../components/auth-provider";
import { DetailRow } from "../../../../components/detail-row";
import { ErrorCard, PageLoading } from "../../../../components/page-feedback";
import { OrderBadge } from "../../../../components/status-badge";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui";
import { api } from "../../../../lib/api";
import { formatDate, formatSom } from "../../../../lib/utils";

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user.role !== "admin") {
      router.replace("/");
      return;
    }
    api.getEmployee(id).then(setData).catch((value) => setError(value.message));
  }, [id, user.role, router]);

  if (user.role !== "admin") return null;
  if (error) return <div className="page-container"><ErrorCard message={error} /></div>;
  if (!data) return <div className="page-container"><PageLoading /></div>;

  const { employee, orders } = data;

  return (
    <div className="page-container">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2">
          <Link href="/employees"><ArrowLeft className="h-4 w-4" />Xodimlarga qaytish</Link>
        </Button>
        <h1 className="page-title">{employee.user.name}</h1>
        <p className="page-description">{employee.position}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Xodim ma'lumotlari</CardTitle></CardHeader>
          <CardContent>
            <dl>
              <DetailRow label="Holat" value={<Badge variant={employee.status === "active" ? "default" : "outline"}>{employee.status === "active" ? "Faol" : "Nofaol"}</Badge>} />
              <DetailRow label="Email" value={employee.user.email} />
              <DetailRow label="Telefon" value={employee.phone} />
              <DetailRow label="Ishga kirgan sana" value={formatDate(employee.hiredAt)} />
              <DetailRow label="Oylik maosh" value={formatSom(employee.salary)} />
              <DetailRow label="Manzil" value={employee.address} />
            </dl>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Yaratgan buyurtmalari</CardTitle></CardHeader>
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
    </div>
  );
}
