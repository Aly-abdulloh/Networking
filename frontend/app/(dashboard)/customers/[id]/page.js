"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../../../components/auth-provider";
import { DetailRow } from "../../../../components/detail-row";
import { ErrorCard, PageLoading } from "../../../../components/page-feedback";
import { CustomerBadge, OrderBadge } from "../../../../components/status-badge";
import { useToast } from "../../../../components/toast-provider";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  Input,
} from "../../../../components/ui";
import { api } from "../../../../lib/api";
import { formatDate, formatSom } from "../../../../lib/utils";
import { customerAccountSchema } from "../../../../lib/validation";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const {
    register,
    handleSubmit,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(customerAccountSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    api.getCustomer(id).then(setData).catch((value) => setError(value.message));
  }, [id]);

  async function createAccount(values) {
    try {
      await api.createCustomerAccount(id, values);
      toast("Mijoz uchun kirish accounti yaratildi");
      setAccountOpen(false);
      setData(await api.getCustomer(id));
    } catch (value) {
      setFormError("root", { message: value.message });
    }
  }

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

  const { customer, orders } = data;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-3 mb-2">
            <Link href="/customers">
              <ArrowLeft className="h-4 w-4" />
              Mijozlarga qaytish
            </Link>
          </Button>
          <h1 className="page-title">{customer.name}</h1>
          <p className="page-description">{customer.company || "Jismoniy mijoz"}</p>
        </div>
        {user.role === "admin" && !customer.user && (
          <Button onClick={() => setAccountOpen(true)}>
            <KeyRound className="h-4 w-4" />
            Account yaratish
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Asosiy ma'lumotlar</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <DetailRow label="Holat" value={<CustomerBadge status={customer.status} />} />
              <DetailRow label="Telefon" value={customer.phone} />
              <DetailRow label="Email" value={customer.email} />
              <DetailRow label="Shahar" value={customer.city} />
              <DetailRow
                label="Account"
                value={customer.user ? "Faol account mavjud" : "Yaratilmagan"}
              />
              <DetailRow label="Yaratilgan" value={formatDate(customer.createdAt)} />
            </dl>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>So'nggi buyurtmalar</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="table-wrap">
              <table className="data-table min-w-[560px]">
                <thead>
                  <tr>
                    <th>Sana</th>
                    <th>Mahsulotlar</th>
                    <th>Summa</th>
                    <th>Holat</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)} dona</td>
                      <td className="font-medium">{formatSom(order.total)}</td>
                      <td><OrderBadge status={order.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {customer.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Eslatma</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {customer.notes}
          </CardContent>
        </Card>
      )}

      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mijoz accounti</DialogTitle>
            <DialogDescription>
              Mijoz shu email va parol bilan kabinetiga kiradi.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit(createAccount)}>
            <Field label="Email" error={errors.email?.message}>
              <Input type="email" placeholder="mijoz@example.com" {...register("email")} />
            </Field>
            <Field label="Vaqtinchalik parol" error={errors.password?.message}>
              <Input type="password" placeholder="AtlasClient123" {...register("password")} />
            </Field>
            {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAccountOpen(false)}>
                Bekor qilish
              </Button>
              <Button disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Yaratish
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
