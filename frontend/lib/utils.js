import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatSom(value) {
  return `${new Intl.NumberFormat("uz-UZ").format(Number(value) || 0)} so'm`;
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getFullYear()}`;
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export const roleLabels = {
  admin: "Administrator",
  employee: "Xodim",
  customer: "Mijoz",
};

export const orderStatuses = {
  new: "Yangi",
  processing: "Jarayonda",
  shipped: "Jo'natilgan",
  completed: "Yakunlangan",
  cancelled: "Bekor qilingan",
};

export const customerStatuses = {
  active: "Faol",
  inactive: "Nofaol",
  lead: "Potensial",
};

export const categories = {
  mens: "Erkaklar",
  womens: "Ayollar",
  kids: "Bolalar",
  accessories: "Aksessuarlar",
};

export function phoneMask(value) {
  const digits = value.replace(/\D/g, "").replace(/^998/, "").slice(0, 9);
  const parts = ["+998"];
  if (digits.length) parts.push(` ${digits.slice(0, 2)}`);
  if (digits.length > 2) parts.push(` ${digits.slice(2, 5)}`);
  if (digits.length > 5) parts.push(` ${digits.slice(5, 7)}`);
  if (digits.length > 7) parts.push(` ${digits.slice(7, 9)}`);
  return parts.join("");
}
