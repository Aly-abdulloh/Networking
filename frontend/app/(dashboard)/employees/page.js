"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "../../../components/ui";
import { useDebounce } from "../../../hooks/use-debounce";
import { api } from "../../../lib/api";
import { formatDate, formatSom, phoneMask } from "../../../lib/utils";
import { employeeSchema } from "../../../lib/validation";

const emptyEmployee = {
  name: "",
  email: "",
  password: "",
  phone: "+998",
  position: "",
  hiredAt: "",
  salary: "",
  address: "",
  status: "active",
};

export default function EmployeesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [data, setData] = useState({ items: [], pagination: null });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
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
    setValue,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: emptyEmployee,
  });

  useEffect(() => {
    if (user.role !== "admin") router.replace("/");
  }, [user.role, router]);

  const load = useCallback(async () => {
    if (user.role !== "admin") return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (status) params.set("status", status);
    try {
      setData(await api.getEmployees(`?${params}`));
      setError("");
    } catch (value) {
      setError(value.message);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, user.role]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  function openCreate() {
    setEditing(null);
    reset(emptyEmployee);
    setFormOpen(true);
  }

  function openEdit(employee) {
    setEditing(employee);
    reset({
      name: employee.user.name,
      email: employee.user.email,
      password: "",
      phone: employee.phone,
      position: employee.position,
      hiredAt: new Date(employee.hiredAt).toISOString().slice(0, 10),
      salary: employee.salary,
      address: employee.address || "",
      status: employee.status,
    });
    setFormOpen(true);
  }

  async function submit(values) {
    if (!editing && !values.password) {
      setFormError("password", { message: "Vaqtinchalik parolni kiriting" });
      return;
    }
    try {
      if (editing) {
        const { password, ...update } = values;
        await api.updateEmployee(editing._id, update);
        toast("Xodim ma'lumotlari yangilandi");
      } else {
        await api.createEmployee(values);
        toast("Yangi xodim yaratildi");
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
      await api.deleteEmployee(deleting._id);
      toast("Xodim arxivlandi");
      setDeleting(null);
      await load();
    } catch (value) {
      toast(value.message, "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  const phoneField = register("phone");

  if (user.role !== "admin") return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Xodimlar</h1>
          <p className="page-description">Xodim accountlari va ish ma'lumotlarini boshqaring</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" />Yangi xodim</Button>
      </div>
      {error && <ErrorCard message={error} />}
      <Card>
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Ism yoki email bo'yicha..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Select className="sm:w-44" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Barcha holatlar</option>
            <option value="active">Faol</option>
            <option value="inactive">Nofaol</option>
          </Select>
        </div>
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}
          </div>
        ) : data.items.length === 0 ? (
          <EmptyState title="Xodim topilmadi" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Xodim</th><th>Telefon</th><th>Lavozim</th><th>Ishga kirgan</th><th>Maosh</th><th>Holat</th><th className="text-right">Amallar</th></tr></thead>
              <tbody>
                {data.items.map((employee) => (
                  <tr key={employee._id}>
                    <td><p className="font-medium">{employee.user.name}</p><p className="text-xs text-muted-foreground">{employee.user.email}</p></td>
                    <td>{employee.phone}</td>
                    <td>{employee.position}</td>
                    <td>{formatDate(employee.hiredAt)}</td>
                    <td>{formatSom(employee.salary)}</td>
                    <td><Badge variant={employee.status === "active" ? "default" : "outline"}>{employee.status === "active" ? "Faol" : "Nofaol"}</Badge></td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            href={`/employees/${employee._id}`}
                            aria-label={`${employee.user.name} ma'lumotlarini ko'rish`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(employee)}
                          aria-label={`${employee.user.name}ni tahrirlash`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => setDeleting(employee)}
                          aria-label={`${employee.user.name}ni arxivlash`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
            <DialogTitle>{editing ? "Xodimni tahrirlash" : "Yangi xodim"}</DialogTitle>
            <DialogDescription>Xodim uchun account va ish ma'lumotlarini kiriting.</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit(submit)}>
            <div className="form-grid">
              <Field label="To'liq ism *" error={errors.name?.message}>
                <Input placeholder="Jasur Tursunov" {...register("name")} />
              </Field>
              <Field label="Telefon *" error={errors.phone?.message}>
                <Input
                  placeholder="+998 90 123 45 67"
                  inputMode="numeric"
                  {...phoneField}
                  onChange={(event) => setValue("phone", phoneMask(event.target.value), { shouldValidate: true })}
                />
              </Field>
            </div>
            <div className="form-grid">
              <Field label="Email *" error={errors.email?.message}>
                <Input type="email" placeholder="xodim@atlas.uz" {...register("email")} />
              </Field>
              {!editing && (
                <Field label="Vaqtinchalik parol *" error={errors.password?.message}>
                  <Input type="password" placeholder="AtlasStaff123" {...register("password")} />
                </Field>
              )}
            </div>
            <div className="form-grid">
              <Field label="Lavozim *" error={errors.position?.message}>
                <Input placeholder="Savdo menejeri" {...register("position")} />
              </Field>
              <Field label="Ishga kirgan sana *" error={errors.hiredAt?.message}>
                <Input type="date" {...register("hiredAt")} />
              </Field>
            </div>
            <div className="form-grid">
              <Field label="Oylik maosh" error={errors.salary?.message}>
                <Input type="number" min="0" placeholder="5000000" {...register("salary")} />
              </Field>
              <Field label="Holat" error={errors.status?.message}>
                <Select {...register("status")}><option value="active">Faol</option><option value="inactive">Nofaol</option></Select>
              </Field>
            </div>
            <Field label="Manzil" error={errors.address?.message}>
              <Input placeholder="Toshkent sh., Chilonzor tumani" {...register("address")} />
            </Field>
            {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Bekor qilish</Button>
              <Button disabled={isSubmitting}>{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}Saqlash</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xodimni arxivlash"
        description={`${deleting?.user?.name || "Xodim"} tizimga kira olmaydi, yaratgan buyurtmalari saqlanadi.`}
        onConfirm={remove}
        loading={deleteLoading}
      />
    </div>
  );
}
