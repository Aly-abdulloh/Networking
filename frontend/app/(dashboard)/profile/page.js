"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../../components/auth-provider";
import { RoleBadge } from "../../../components/status-badge";
import { useToast } from "../../../components/toast-provider";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Input,
} from "../../../components/ui";
import { api } from "../../../lib/api";
import { phoneMask } from "../../../lib/utils";
import { passwordSchema, profileSchema } from "../../../lib/validation";

export default function ProfilePage() {
  const { user, profile, refresh } = useAuth();
  const { toast } = useToast();
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      phone: profile?.phone || "",
      company: profile?.company || "",
      city: profile?.city || "",
      address: profile?.address || "",
    },
  });
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  useEffect(() => {
    profileForm.reset({
      name: user.name,
      phone: profile?.phone || "",
      company: profile?.company || "",
      city: profile?.city || "",
      address: profile?.address || "",
    });
  }, [user, profile, profileForm]);

  async function updateProfile(values) {
    try {
      await api.updateProfile(values);
      await refresh();
      toast("Profil ma'lumotlari yangilandi");
    } catch (error) {
      Object.entries(error.errors || {}).forEach(([field, message]) =>
        profileForm.setError(field, { message })
      );
      if (!Object.keys(error.errors || {}).length) {
        profileForm.setError("root", { message: error.message });
      }
    }
  }

  async function updatePassword(values) {
    try {
      await api.changePassword(values);
      passwordForm.reset();
      toast("Parol muvaffaqiyatli yangilandi");
    } catch (error) {
      passwordForm.setError("root", { message: error.message });
    }
  }

  const phoneField = profileForm.register("phone");

  return (
    <div className="page-container">
      <div>
        <h1 className="page-title">Profil</h1>
        <p className="page-description">Shaxsiy ma'lumot va xavfsizlik sozlamalari</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Shaxsiy ma'lumotlar</CardTitle>
            <CardDescription>
              <span className="mr-2">{user.email}</span>
              <RoleBadge role={user.role} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={profileForm.handleSubmit(updateProfile)}>
              <Field label="To'liq ism" error={profileForm.formState.errors.name?.message}>
                <Input placeholder="Ism va familiya" {...profileForm.register("name")} />
              </Field>
              {user.role !== "admin" && (
                <Field label="Telefon" error={profileForm.formState.errors.phone?.message}>
                  <Input
                    placeholder="+998 90 123 45 67"
                    inputMode="numeric"
                    {...phoneField}
                    onChange={(event) =>
                      profileForm.setValue("phone", phoneMask(event.target.value), {
                        shouldValidate: true,
                      })
                    }
                  />
                </Field>
              )}
              {user.role === "customer" && (
                <div className="form-grid">
                  <Field label="Kompaniya" error={profileForm.formState.errors.company?.message}>
                    <Input placeholder="Kompaniya nomi" {...profileForm.register("company")} />
                  </Field>
                  <Field label="Shahar" error={profileForm.formState.errors.city?.message}>
                    <Input placeholder="Toshkent" {...profileForm.register("city")} />
                  </Field>
                </div>
              )}
              {user.role === "employee" && (
                <Field label="Manzil" error={profileForm.formState.errors.address?.message}>
                  <Input placeholder="Yashash manzili" {...profileForm.register("address")} />
                </Field>
              )}
              {profileForm.formState.errors.root && (
                <p className="text-sm text-destructive">{profileForm.formState.errors.root.message}</p>
              )}
              <Button disabled={profileForm.formState.isSubmitting}>
                {profileForm.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Saqlash
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parolni yangilash</CardTitle>
            <CardDescription>Kuchli va takrorlanmagan paroldan foydalaning.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={passwordForm.handleSubmit(updatePassword)}>
              <Field label="Joriy parol" error={passwordForm.formState.errors.currentPassword?.message}>
                <Input type="password" autoComplete="current-password" placeholder="Joriy parol" {...passwordForm.register("currentPassword")} />
              </Field>
              <Field label="Yangi parol" error={passwordForm.formState.errors.newPassword?.message}>
                <Input type="password" autoComplete="new-password" placeholder="Kamida 8 belgi, harf va raqam" {...passwordForm.register("newPassword")} />
              </Field>
              {passwordForm.formState.errors.root && (
                <p className="text-sm text-destructive">{passwordForm.formState.errors.root.message}</p>
              )}
              <Button variant="outline" className="w-full" disabled={passwordForm.formState.isSubmitting}>
                {passwordForm.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                Parolni almashtirish
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
