"use client";

import * as Avatar from "@radix-ui/react-avatar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Boxes,
  ChevronDown,
  CircleUserRound,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  ShoppingBag,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./auth-provider";
import { ThemeToggle } from "./theme-toggle";
import { Button, Skeleton } from "./ui";
import { cn, initials, roleLabels } from "../lib/utils";

const navigation = {
  admin: [
    { href: "/", label: "Boshqaruv paneli", icon: LayoutDashboard },
    { href: "/customers", label: "Mijozlar", icon: UsersRound },
    { href: "/products", label: "Mahsulotlar", icon: Boxes },
    { href: "/orders", label: "Buyurtmalar", icon: ClipboardList },
    { href: "/employees", label: "Xodimlar", icon: UserRound },
    { href: "/profile", label: "Profil", icon: CircleUserRound },
  ],
  employee: [
    { href: "/", label: "Boshqaruv paneli", icon: LayoutDashboard },
    { href: "/customers", label: "Mijozlar", icon: UsersRound },
    { href: "/products", label: "Mahsulotlar", icon: Boxes },
    { href: "/orders", label: "Buyurtmalar", icon: ClipboardList },
    { href: "/profile", label: "Profil", icon: CircleUserRound },
  ],
  customer: [
    { href: "/", label: "Kabinet", icon: LayoutDashboard },
    { href: "/my-orders", label: "Buyurtmalarim", icon: ShoppingBag },
    { href: "/purchases", label: "Mahsulotlarim", icon: PackageCheck },
    { href: "/profile", label: "Profil", icon: CircleUserRound },
  ],
};

function SidebarContent({ items, pathname, close }) {
  return (
    <>
      <div className="flex h-16 items-center border-b px-5">
        <Link href="/" className="flex items-center gap-2" onClick={close}>
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            A
          </span>
          <div>
            <div className="text-sm font-semibold leading-none">Atlas</div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Tekstil CRM
            </div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4 text-xs text-muted-foreground">
        Atlas savdo boshqaruvi
      </div>
    </>
  );
}

export function DashboardShell({ children }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = useMemo(() => navigation[user?.role] || [], [user?.role]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
    router.refresh();
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen">
        <div className="hidden w-64 border-r p-5 lg:block">
          <Skeleton className="h-9 w-32" />
          <div className="mt-8 space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="mt-8 h-72 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-background lg:flex">
        <SidebarContent items={items} pathname={pathname} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-label="Menyuni yopish"
          />
          <aside className="relative flex h-full w-72 flex-col border-r bg-background shadow-xl">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 z-10"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <SidebarContent
              items={items}
              pathname={pathname}
              close={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Menyuni ochish"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm font-medium">Atlas Tekstil</p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                {roleLabels[user.role]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button variant="ghost" className="h-10 px-2">
                  <Avatar.Root className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    <Avatar.Fallback>{initials(user.name)}</Avatar.Fallback>
                  </Avatar.Root>
                  <span className="hidden max-w-32 truncate sm:inline">
                    {user.name}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  className="z-50 min-w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-lg"
                >
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenu.Separator className="my-1 h-px bg-border" />
                  <DropdownMenu.Item asChild>
                    <Link
                      href="/profile"
                      className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent"
                    >
                      <CircleUserRound className="h-4 w-4" />
                      Profil
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={handleLogout}
                    className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-sm text-destructive outline-none hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Chiqish
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
