import { z } from "zod";

const phone = z
  .string()
  .regex(/^\+998 \d{2} \d{3} \d{2} \d{2}$/, "Telefon formatini to'liq kiriting");
const optionalPhone = z.union([phone, z.literal("")]);
const email = z.string().email("Email manzili noto'g'ri");
const password = z
  .string()
  .min(8, "Kamida 8 ta belgi kiriting")
  .regex(/[a-z]/, "Kichik harf kiriting")
  .regex(/[A-Z]/, "Katta harf kiriting")
  .regex(/\d/, "Raqam kiriting");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Parolni kiriting"),
});

export const customerAccountSchema = z.object({
  email,
  password,
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Ismni kiriting"),
  email,
  phone,
  company: z.string().trim(),
  city: z.string().trim(),
  password,
});

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Ismni kiriting"),
  company: z.string().trim(),
  email: z.union([email, z.literal("")]),
  phone: optionalPhone,
  city: z.string().trim(),
  type: z.enum(["retailer", "wholesaler", "online"]),
  status: z.enum(["active", "inactive", "lead"]),
  notes: z.string().trim(),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Mahsulot nomini kiriting"),
  sku: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9-]*$/, "Faqat harf, raqam va chiziq ishlating"),
  category: z.enum(["mens", "womens", "kids", "accessories"]),
  size: z.string().trim(),
  price: z.coerce.number().min(0, "Narx manfiy bo'lmaydi"),
  stock: z.coerce.number().int().min(0, "Qoldiq manfiy bo'lmaydi"),
  lowStockThreshold: z.coerce.number().int().min(0),
  description: z.string().trim(),
});

export const employeeSchema = z.object({
  name: z.string().trim().min(2, "Ismni kiriting"),
  email,
  password: z.union([password, z.literal("")]).optional(),
  phone,
  position: z.string().trim().min(2, "Lavozimni kiriting"),
  hiredAt: z.string().min(1, "Ishga kirgan sanani kiriting"),
  salary: z.coerce.number().min(0),
  address: z.string().trim(),
  status: z.enum(["active", "inactive"]),
});

export const orderSchema = z
  .object({
    customer: z.string().min(1, "Mijozni tanlang"),
    status: z.enum(["new", "processing", "shipped", "completed", "cancelled"]),
    notes: z.string().trim(),
    items: z
      .array(
        z.object({
          product: z.string().min(1, "Mahsulotni tanlang"),
          quantity: z.coerce.number().int().min(1, "Miqdor kamida 1 bo'lsin"),
        })
      )
      .min(1, "Kamida bitta mahsulot kiriting"),
  })
  .refine(
    (value) =>
      new Set(value.items.map((item) => item.product)).size === value.items.length,
    { message: "Bir mahsulotni ikki marta kiritmang", path: ["items"] }
  );

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Ismni kiriting"),
  phone: optionalPhone.optional(),
  company: z.string().trim().optional(),
  city: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Joriy parolni kiriting"),
  newPassword: password,
});
