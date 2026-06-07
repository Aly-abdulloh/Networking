"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../../components/auth-provider";
import { ConfirmDialog } from "../../../components/confirm-dialog";
import { EmptyState, ErrorCard } from "../../../components/page-feedback";
import { Pagination } from "../../../components/pagination";
import { useToast } from "../../../components/toast-provider";
import {
  Badge,
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
import { categories, formatSom } from "../../../lib/utils";
import { productSchema } from "../../../lib/validation";

const emptyProduct = {
  name: "",
  sku: "",
  category: "mens",
  size: "",
  price: "",
  stock: "",
  lowStockThreshold: 20,
  description: "",
};

export default function ProductsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState({ items: [], pagination: null });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const debouncedSearch = useDebounce(search);
  const {
    register,
    handleSubmit,
    reset,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: emptyProduct,
  });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (category) params.set("category", category);
    if (lowStock) params.set("lowStock", "true");
    try {
      setData(await api.getProducts(`?${params}`));
      setError("");
    } catch (value) {
      setError(value.message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, category, lowStock]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, lowStock]);

  function openCreate() {
    setEditing(null);
    reset(emptyProduct);
    setFormOpen(true);
  }

  function openEdit(product) {
    setEditing(product);
    reset({
      name: product.name,
      sku: product.sku || "",
      category: product.category,
      size: product.size || "",
      price: product.price,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      description: product.description || "",
    });
    setFormOpen(true);
  }

  async function submit(values) {
    try {
      if (editing) {
        await api.updateProduct(editing._id, values);
        toast("Mahsulot yangilandi");
      } else {
        await api.createProduct(values);
        toast("Yangi mahsulot yaratildi");
      }
      setFormOpen(false);
      await load();
    } catch (value) {
      Object.entries(value.errors || {}).forEach(([field, message]) =>
        setFormError(field, { message })
      );
      if (!Object.keys(value.errors || {}).length) {
        setFormError("root", { message: value.message });
      }
    }
  }

  async function remove() {
    setDeleteLoading(true);
    try {
      await api.deleteProduct(deleting._id);
      toast("Mahsulot arxivlandi");
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
          <h1 className="page-title">Mahsulotlar</h1>
          <p className="page-description">Katalog va ombor qoldig'ini boshqaring</p>
        </div>
        {user.role === "admin" && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Yangi mahsulot
          </Button>
        )}
      </div>
      {error && <ErrorCard message={error} />}
      <Card>
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Mahsulot nomi yoki SKU..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Select
            className="md:w-44"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">Barcha kategoriyalar</option>
            {Object.entries(categories).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </Select>
          <label className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm">
            <input
              type="checkbox"
              checked={lowStock}
              onChange={(event) => setLowStock(event.target.checked)}
            />
            Kam qolganlar
          </label>
        </div>
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        ) : data.items.length === 0 ? (
          <EmptyState title="Mahsulot topilmadi" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mahsulot</th>
                  <th>Kategoriya</th>
                  <th>O'lcham</th>
                  <th>Narx</th>
                  <th>Qoldiq</th>
                  <th className="text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((product) => {
                  const low = product.stock <= product.lowStockThreshold;
                  return (
                    <tr key={product._id}>
                      <td>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sku || "SKU yo'q"}</p>
                      </td>
                      <td>{categories[product.category]}</td>
                      <td>{product.size || "—"}</td>
                      <td className="font-medium">{formatSom(product.price)}</td>
                      <td>
                        <Badge variant={low ? "destructive" : "secondary"}>
                          {product.stock} dona
                        </Badge>
                      </td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link
                              href={`/products/${product._id}`}
                              aria-label={`${product.name} ma'lumotlarini ko'rish`}
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(product)}
                            aria-label={`${product.name}ni tahrirlash`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {user.role === "admin" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => setDeleting(product)}
                              aria-label={`${product.name}ni arxivlash`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={data.pagination} onPage={setPage} />
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}</DialogTitle>
            <DialogDescription>Mahsulot va ombor ma'lumotlarini kiriting.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit(submit)}>
            <Field label="Mahsulot nomi *" error={errors.name?.message}>
              <Input placeholder="Erkaklar klassik ko'ylagi" {...register("name")} />
            </Field>
            <div className="form-grid">
              <Field label="SKU" error={errors.sku?.message}>
                <Input placeholder="MEN-SH-001" {...register("sku")} />
              </Field>
              <Field label="Kategoriya" error={errors.category?.message}>
                <Select {...register("category")}>
                  {Object.entries(categories).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="form-grid">
              <Field label="O'lcham" error={errors.size?.message}>
                <Input placeholder="S-XL yoki Universal" {...register("size")} />
              </Field>
              <Field label="Narx (so'm) *" error={errors.price?.message}>
                <Input type="number" min="0" placeholder="150000" {...register("price")} />
              </Field>
            </div>
            <div className="form-grid">
              <Field label="Ombor qoldig'i *" error={errors.stock?.message}>
                <Input type="number" min="0" placeholder="100" {...register("stock")} />
              </Field>
              <Field label="Kam qolish chegarasi" error={errors.lowStockThreshold?.message}>
                <Input type="number" min="0" placeholder="20" {...register("lowStockThreshold")} />
              </Field>
            </div>
            <Field label="Tavsif" error={errors.description?.message}>
              <Textarea placeholder="Mahsulot haqida qisqa ma'lumot..." {...register("description")} />
            </Field>
            {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Bekor qilish
              </Button>
              <Button disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Saqlash
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Mahsulotni arxivlash"
        description={`${deleting?.name || "Mahsulot"} katalogdan yashiriladi, eski buyurtmalarda saqlanadi.`}
        onConfirm={remove}
        loading={deleteLoading}
      />
    </div>
  );
}
