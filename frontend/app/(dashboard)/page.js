"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Boxes,
  CircleDollarSign,
  ClipboardList,
  PackageCheck,
  TriangleAlert,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../components/auth-provider";
import { ErrorCard, PageLoading } from "../../components/page-feedback";
import { OrderBadge } from "../../components/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui";
import { api } from "../../lib/api";
import { formatDate, formatSom, orderStatuses } from "../../lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getDashboard().then(setData).catch((value) => setError(value.message));
  }, []);

  if (error) {
    return (
      <div className="page-container">
        <ErrorCard message={error} />
      </div>
    );
  }
  if (!data) {
    return (
      <div className="page-container">
        <PageLoading />
      </div>
    );
  }

  const customer = user.role === "customer";
  const stats = customer
    ? [
        { label: "Buyurtmalar", value: data.stats.orders, icon: ClipboardList },
        {
          label: "Faol buyurtmalar",
          value: data.stats.activeOrders,
          icon: PackageCheck,
        },
        {
          label: "Xarid qilingan",
          value: `${data.stats.purchases} dona`,
          icon: Boxes,
        },
        {
          label: "Jami xarajat",
          value: formatSom(data.stats.spent),
          icon: CircleDollarSign,
        },
      ]
    : [
        { label: "Mijozlar", value: data.stats.customers, icon: UsersRound },
        { label: "Mahsulotlar", value: data.stats.products, icon: Boxes },
        {
          label: "Buyurtmalar",
          value: data.stats.orders,
          icon: ClipboardList,
        },
        {
          label: "Daromad",
          value: formatSom(data.stats.revenue),
          icon: CircleDollarSign,
        },
        {
          label: "Kam qolgan",
          value: data.stats.lowStockCount,
          icon: TriangleAlert,
        },
      ];

  return (
    <div className="page-container">
      <div>
        <h1 className="page-title">
          {customer ? `Xush kelibsiz, ${user.name}` : "Boshqaruv paneli"}
        </h1>
        <p className="page-description">
          {customer
            ? "Buyurtma va xaridlaringizning qisqa ko'rinishi"
            : "Savdo va ombor ko'rsatkichlarining umumiy ko'rinishi"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight">
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="min-w-0 xl:col-span-2">
          <CardHeader>
            <CardTitle>{customer ? "Xarajatlar" : "Oylik daromad"}</CardTitle>
            <CardDescription>So'nggi 6 oy bo'yicha</CardDescription>
          </CardHeader>
          <CardContent className="h-80 min-w-0">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              initialDimension={{ width: 600, height: 320 }}
            >
              <AreaChart data={data.monthlyRevenue}>
                <defs>
                  <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="currentColor" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                />
                <Tooltip formatter={(value) => formatSom(value)} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="currentColor"
                  fill="url(#revenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Buyurtma holatlari</CardTitle>
            <CardDescription>Joriy taqsimot</CardDescription>
          </CardHeader>
          <CardContent className="h-80 min-w-0">
            <ResponsiveContainer
              width="100%"
              height="100%"
              minWidth={0}
              initialDimension={{ width: 320, height: 320 }}
            >
              <BarChart data={data.ordersByStatus}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis
                  dataKey="status"
                  axisLine={false}
                  tickLine={false}
                  fontSize={10}
                  interval={0}
                  tickFormatter={(value) => orderStatuses[value]}
                />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip
                  labelFormatter={(value) => orderStatuses[value]}
                  formatter={(value) => [`${value} ta`, "Buyurtma"]}
                />
                <Bar dataKey="count" fill="currentColor" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>So'nggi buyurtmalar</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="table-wrap">
              <table className="data-table min-w-[560px]">
                <thead>
                  <tr>
                    {!customer && <th>Mijoz</th>}
                    <th>Sana</th>
                    <th>Summa</th>
                    <th>Holat</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order._id}>
                      {!customer && (
                        <td className="font-medium">
                          {order.customer?.company || order.customer?.name || "—"}
                        </td>
                      )}
                      <td>{formatDate(order.createdAt)}</td>
                      <td className="font-medium">{formatSom(order.total)}</td>
                      <td>
                        <OrderBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {!customer && (
          <Card>
            <CardHeader>
              <CardTitle>Kam qolgan mahsulotlar</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="table-wrap">
                <table className="data-table min-w-[480px]">
                  <thead>
                    <tr>
                      <th>Mahsulot</th>
                      <th>SKU</th>
                      <th>Qoldiq</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.lowStockProducts.map((product) => (
                      <tr key={product._id}>
                        <td className="font-medium">{product.name}</td>
                        <td className="text-muted-foreground">{product.sku}</td>
                        <td>{product.stock} dona</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
