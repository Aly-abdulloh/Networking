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
import { CustomerBadge } from "../../../components/status-badge";
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
import { customerStatuses, phoneMask } from "../../../lib/utils";
import { customerSchema } from "../../../lib/validation";

const emptyCustomer = {
  name: "",
  company: "",
  email: "",
  phone: "",
  city: "",
  type: "retailer",
  status: "active",
  notes: "",
};

export default function CustomersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState({ items: [], pagination: null });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const debouncedSearch = useDebounce(search);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: emptyCustomer,
  });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "10",
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (status) params.set("status", status);
    try {
      setData(await api.getCustomers(`?${params}`));
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

  function openCreate() {
    setEditing(null);
    reset(emptyCustomer);
    setFormOpen(true);
  }

  function openEdit(customer) {
    setEditing(customer);
    reset({
      name: customer.name,
      company: customer.company || "",
      email: customer.email || "",
      phone: customer.phone || "",
      city: customer.city || "",
      type: customer.type,
      status: customer.status,
      notes: customer.notes || "",
    });
    setFormOpen(true);
  }

  async function submit(values) {
    try {
      if (editing) {
        await api.updateCustomer(editing._id, values);
        toast("Mijoz ma'lumotlari yangilandi");
      } else {
        await api.createCustomer(values);
        toast("Yangi mijoz yaratildi");
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
      await api.deleteCustomer(deleting._id);
      toast("Mijoz arxivlandi");
      setDeleting(null);
      await load();
    } catch (value) {
      toast(value.message, "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  const phoneField = register("phone");

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mijozlar</h1>
          <p className="page-description">
            Chakana va ulgurji mijozlar bazasini boshqaring
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Yangi mijoz
        </Button>
      </div>

      {error && <ErrorCard message={error} />}

      <Card>
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Ism, kompaniya, email yoki telefon..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Select
            className="sm:w-44"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">Barcha holatlar</option>
            {Object.entries(customerStatuses).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
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
          <EmptyState title="Mijoz topilmadi" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mijoz</th>
                  <th>Aloqa</th>
                  <th>Shahar</th>
                  <th>Turi</th>
                  <th>Holat</th>
                  <th className="text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((customer) => (
                  <tr key={customer._id}>
                    <td>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer.company || "Kompaniya ko'rsatilmagan"}
                      </p>
                    </td>
                    <td>
                      <p>{customer.phone || "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer.email || "—"}
                      </p>
                    </td>
                    <td>{customer.city || "—"}</td>
                    <td>
                      {customer.type === "retailer"
                        ? "Chakana"
                        : customer.type === "wholesaler"
                          ? "Ulgurji"
                          : "Onlayn"}
                    </td>
                    <td>
                      <CustomerBadge status={customer.status} />
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            href={`/customers/${customer._id}`}
                            aria-label={`${customer.name} ma'lumotlarini ko'rish`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(customer)}
                          aria-label={`${customer.name}ni tahrirlash`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {user.role === "admin" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => setDeleting(customer)}
                            aria-label={`${customer.name}ni arxivlash`}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Mijozni tahrirlash" : "Yangi mijoz"}
            </DialogTitle>
            <DialogDescription>
              Mijozning aloqa va savdo ma'lumotlarini kiriting.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(submit)} className="space-y-4">
            <div className="form-grid">
              <Field label="To'liq ism *" error={errors.name?.message}>
                <Input placeholder="Dilshod Karimov" {...register("name")} />
              </Field>
              <Field label="Kompaniya" error={errors.company?.message}>
                <Input placeholder="Moda Butik" {...register("company")} />
              </Field>
            </div>
            <div className="form-grid">
              <Field label="Email" error={errors.email?.message}>
                <Input
                  type="email"
                  placeholder="dilshod@example.com"
                  {...register("email")}
                />
              </Field>
              <Field label="Telefon" error={errors.phone?.message}>
                <Input
                  placeholder="+998 90 123 45 67"
                  inputMode="numeric"
                  {...phoneField}
                  onChange={(event) =>
                    setValue("phone", phoneMask(event.target.value), {
                      shouldValidate: true,
                    })
                  }
                />
              </Field>
            </div>
            <div className="form-grid">
              <Field label="Shahar" error={errors.city?.message}>
                <Input placeholder="Toshkent" {...register("city")} />
              </Field>
              <Field label="Mijoz turi" error={errors.type?.message}>
                <Select {...register("type")}>
                  <option value="retailer">Chakana</option>
                  <option value="wholesaler">Ulgurji</option>
                  <option value="online">Onlayn</option>
                </Select>
              </Field>
            </div>
            <Field label="Holat" error={errors.status?.message}>
              <Select {...register("status")}>
                <option value="active">Faol</option>
                <option value="inactive">Nofaol</option>
                <option value="lead">Potensial</option>
              </Select>
            </Field>
            <Field label="Eslatma" error={errors.notes?.message}>
              <Textarea
                placeholder="Mijoz haqida qo'shimcha ma'lumot..."
                {...register("notes")}
              />
            </Field>
            {errors.root && (
              <p className="text-sm text-destructive">{errors.root.message}</p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
              >
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
        title="Mijozni arxivlash"
        description={`${deleting?.name || "Mijoz"} ro'yxatdan yashiriladi, tarixiy buyurtmalari saqlanadi.`}
        onConfirm={remove}
        loading={deleteLoading}
      />
    </div>
  );
}
