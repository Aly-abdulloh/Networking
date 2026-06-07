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
import { loginSchema } from "../../../lib/validation";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  async function submit(values) {
    try {
      await login(values);
      toast("Xush kelibsiz");
      router.replace("/");
      router.refresh();
    } catch (error) {
      setError("root", { message: error.message });
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 lg:hidden">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
          A
        </span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Tizimga kirish</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Atlas CRM hisobingiz ma'lumotlarini kiriting.
      </p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit(submit)}>
        <Field label="Email" error={errors.email?.message}>
          <Input
            type="email"
            placeholder="admin@atlas.uz"
            autoComplete="email"
            {...register("email")}
          />
        </Field>
        <Field label="Parol" error={errors.password?.message}>
          <Input
            type="password"
            placeholder="Parolingiz"
            autoComplete="current-password"
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
          Kirish
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Hisobingiz yo'qmi?{" "}
        <Link href="/register" className="font-medium text-foreground underline">
          Ro'yxatdan o'ting
        </Link>
      </p>
    </div>
  );
}
