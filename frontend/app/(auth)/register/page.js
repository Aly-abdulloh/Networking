"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../../components/auth-provider";
import { useToast } from "../../../components/toast-provider";
import { Button, Field, Input } from "../../../components/ui";
import { phoneMask } from "../../../lib/utils";
import { registerSchema } from "../../../lib/validation";

export default function RegisterPage() {
  const { register: createAccount, user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "+998",
      company: "",
      city: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  async function submit(values) {
    try {
      await createAccount(values);
      toast("Hisob muvaffaqiyatli yaratildi");
      router.replace("/");
      router.refresh();
    } catch (error) {
      Object.entries(error.errors || {}).forEach(([field, message]) =>
        setError(field, { message })
      );
      if (!Object.keys(error.errors || {}).length) {
        setError("root", { message: error.message });
      }
    }
  }

  const phoneField = register("phone");

  return (
    <div className="w-full max-w-md py-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        Mijoz sifatida ro'yxatdan o'tish
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Buyurtmalaringiz va xaridlaringizni kuzatib boring.
      </p>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit(submit)}>
        <div className="form-grid">
          <Field label="To'liq ism" error={errors.name?.message}>
            <Input placeholder="Ali Valiyev" {...register("name")} />
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
        <Field label="Email" error={errors.email?.message}>
          <Input
            type="email"
            placeholder="ali@example.com"
            autoComplete="email"
            {...register("email")}
          />
        </Field>
        <div className="form-grid">
          <Field label="Kompaniya" error={errors.company?.message}>
            <Input placeholder="Moda Store" {...register("company")} />
          </Field>
          <Field label="Shahar" error={errors.city?.message}>
            <Input placeholder="Toshkent" {...register("city")} />
          </Field>
        </div>
        <Field label="Parol" error={errors.password?.message}>
          <Input
            type="password"
            placeholder="Kamida 8 belgi, harf va raqam"
            autoComplete="new-password"
            {...register("password")}
          />
        </Field>
        {errors.root && (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {errors.root.message}
          </p>
        )}
        <Button className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          Ro'yxatdan o'tish
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Hisobingiz bormi?{" "}
        <Link href="/login" className="font-medium text-foreground underline">
          Kirish
        </Link>
      </p>
    </div>
  );
}
