"use client";

import { Eye, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../components/auth-provider";
import { ConfirmDialog } from "../../../components/confirm-dialog";
import { EmptyState, ErrorCard } from "../../../components/page-feedback";
import { Pagination } from "../../../components/pagination";
import { OrderBadge } from "../../../components/status-badge";
import { useToast } from "../../../components/toast-provider";
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  Input,
  Select,
  Skeleton,
  Textarea,
} from "../../../components/ui";
import { useDebounce } from "../../../hooks/use-debounce";
import { api } from "../../../lib/api";
import { formatDate, formatSom, orderStatuses } from "../../../lib/utils";
import { orderSchema } from "../../../lib/validation";

const emptyOrder = {
  customer: "",
  status: "new",
  notes: "",
  items: [{ product: "", quantity: 1 }],
};

export default function OrdersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState({ items: [], pagination: null });
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyOrder);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const debouncedSearch = useDebounce(search);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (status) params.set("status", status);
    try {
      setData(await api.getOrders(`?${params}`));
      setError("");
    } catch (value) {
      setError(value.message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  async function loadOptions() {
    const [customerData, productData] = await Promise.all([
      api.getCustomers("?limit=100&status=active"),
      api.getProducts("?limit=100"),
    ]);
    setCustomers(customerData.items);
    setProducts(productData.items);
  }

  async function openCreate() {
    try {
      await loadOptions();
      setEditing(null);
      setForm(emptyOrder);
      setFormErrors({});
      setFormOpen(true);
    } catch (value) {
      toast(value.message, "error");
    }
  }

  async function openEdit(order) {
    try {
      await loadOptions();
      setEditing(order);
      setForm({
        customer: order.customer?._id || "",
        status: order.status,
        notes: order.notes || "",
        items: order.items.map((item) => ({
          product: item.product,
          quantity: item.quantity,
        })),
      });
      setFormErrors({});
      setFormOpen(true);
    } catch (value) {
      toast(value.message, "error");
    }
  }

  function updateLine(index, key, value) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  }

  const total = useMemo(
    () =>
      form.items.reduce((sum, item) => {
        const product = products.find((value) => value._id === item.product);
        return sum + (product?.price || 0) * (Number(item.quantity) || 0);
      }, 0),
    [form.items, products]
  );

  async function save() {
    const parsed = orderSchema.safeParse(form);
    if (!parsed.success) {
      const errors = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] || "form";
        if (!errors[key]) errors[key] = issue.message;
      });
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    setFormErrors({});
    try {
      if (editing) {
        await api.updateOrder(editing._id, parsed.data);
        toast("Buyurtma yangilandi");
      } else {
        await api.createOrder(parsed.data);
        toast("Yangi buyurtma yaratildi");
      }
      setFormOpen(false);
      await load();
    } catch (value) {
      setFormErrors({ form: value.message });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setDeleteLoading(true);
    try {
      await api.deleteOrder(deleting._id);
      toast("Buyurtma arxivlandi va qoldiq qaytarildi");
      setDeleting(null);
      await load();
    } catch (value) {
      toast(value.message, "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Buyurtmalar</h1>
          <p className="page-description">Savdo buyurtmalari va ularning holatini boshqaring</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Yangi buyurtma
        </Button>
      </div>
      {error && <ErrorCard message={error} />}
      <Card>
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Mijoz bo'yicha qidirish..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Select
            className="sm:w-48"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">Barcha holatlar</option>
            {Object.entries(orderStatuses).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </Select>
        </div>
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : data.items.length === 0 ? (
          <EmptyState title="Buyurtma topilmadi" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mijoz</th>
                  <th>Sana</th>
                  <th>Mahsulotlar</th>
                  <th>Summa</th>
                  <th>Holat</th>
                  <th className="text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((order) => (
                  <tr key={order._id}>
                    <td className="font-medium">{order.customer?.company || order.customer?.name || "—"}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{order.items.reduce((sum, item) => sum + item.quantity, 0)} dona</td>
                    <td className="font-medium">{formatSom(order.total)}</td>
                    <td><OrderBadge status={order.status} /></td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            href={`/orders/${order._id}`}
                            aria-label="Buyurtma ma'lumotlarini ko'rish"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(order)}
                          aria-label="Buyurtmani tahrirlash"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {user.role === "admin" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => setDeleting(order)}
                            aria-label="Buyurtmani arxivlash"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={data.pagination} onPage={setPage} />
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Buyurtmani tahrirlash" : "Yangi buyurtma"}</DialogTitle>
            <DialogDescription>Mahsulot miqdori ombor qoldig'idan avtomatik ayriladi.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="form-grid">
              <Field label="Mijoz *" error={formErrors.customer}>
                <Select
                  value={form.customer}
                  onChange={(event) => setForm({ ...form, customer: event.target.value })}
                >
                  <option value="">Mijozni tanlang</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.company ? `${customer.company} · ${customer.name}` : customer.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Holat" error={formErrors.status}>
                <Select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value })}
                >
                  {Object.entries(orderStatuses).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Mahsulotlar</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm({ ...form, items: [...form.items, { product: "", quantity: 1 }] })
                  }
                >
                  <Plus className="h-4 w-4" />
                  Qator qo'shish
                </Button>
              </div>
              {form.items.map((item, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[1fr_120px_36px]">
                  <Select
                    value={item.product}
                    onChange={(event) => updateLine(index, "product", event.target.value)}
                  >
                    <option value="">Mahsulotni tanlang</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id} disabled={product.stock === 0}>
                        {product.name} · {product.stock} dona · {formatSom(product.price)}
                      </option>
                    ))}
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    inputMode="numeric"
                    value={item.quantity}
                    onChange={(event) => updateLine(index, "quantity", event.target.value)}
                    placeholder="Miqdor"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={form.items.length === 1}
                    onClick={() =>
                      setForm({
                        ...form,
                        items: form.items.filter((_, itemIndex) => itemIndex !== index),
                      })
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {formErrors.items && <p className="text-xs text-destructive">{formErrors.items}</p>}
            </div>
            <Field label="Eslatma">
              <Textarea
                placeholder="Yetkazib berish yoki buyurtma haqida izoh..."
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
              />
            </Field>
            <div className="flex items-center justify-between rounded-md bg-muted p-4">
              <span className="text-sm text-muted-foreground">Taxminiy summa</span>
              <span className="font-semibold">{formatSom(total)}</span>
            </div>
            {formErrors.form && <p className="text-sm text-destructive">{formErrors.form}</p>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setFormOpen(false)}>Bekor qilish</Button>
              <Button onClick={save} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Saqlash
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Buyurtmani arxivlash"
        description="Buyurtma arxivlanadi va rezerv qilingan mahsulotlar omborga qaytariladi."
        onConfirm={remove}
        loading={deleteLoading}
      />
    </div>
  );
}
