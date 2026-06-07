const { z } = require("zod");

const phone = z
  .string()
  .trim()
  .regex(/^\+998 \d{2} \d{3} \d{2} \d{2}$/, "Telefon +998 90 123 45 67 formatida bo'lsin");
const optionalPhone = z.union([phone, z.literal("")]).default("");
const email = z.string().trim().email("Email manzili noto'g'ri").toLowerCase();
const optionalEmail = z.union([email, z.literal("")]).default("");
const password = z
  .string()
  .min(8, "Parol kamida 8 ta belgidan iborat bo'lsin")
  .regex(/[a-z]/, "Parolda kichik harf bo'lsin")
  .regex(/[A-Z]/, "Parolda katta harf bo'lsin")
  .regex(/\d/, "Parolda raqam bo'lsin");
const objectId = z.string().regex(/^[a-f\d]{24}$/i, "ID noto'g'ri");
const shortText = z.string().trim().min(2, "Kamida 2 ta belgi kiriting").max(120);
const optionalText = z.string().trim().max(1000).default("");
const nonNegativeNumber = z.coerce.number().finite().min(0, "Manfiy qiymat mumkin emas");

const registerSchema = z.object({
  name: shortText,
  email,
  phone,
  password,
  company: z.string().trim().max(120).default(""),
  city: z.string().trim().max(80).default(""),
});

const loginSchema = z.object({
  email,
  password: z.string().min(1, "Parolni kiriting"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Joriy parolni kiriting"),
  newPassword: password,
});

const profileSchema = z.object({
  name: shortText,
  phone: optionalPhone.optional(),
  company: z.string().trim().max(120).optional(),
  city: z.string().trim().max(80).optional(),
  address: z.string().trim().max(250).optional(),
});

const customerSchema = z.object({
  name: shortText,
  company: z.string().trim().max(120).default(""),
  email: optionalEmail,
  phone: optionalPhone,
  city: z.string().trim().max(80).default(""),
  type: z.enum(["retailer", "wholesaler", "online"]).default("retailer"),
  status: z.enum(["active", "inactive", "lead"]).default("active"),
  notes: optionalText,
});

const customerAccountSchema = z.object({
  email,
  password,
});

const productSchema = z.object({
  name: shortText,
  sku: z
    .string()
    .trim()
    .max(40)
    .regex(/^[A-Za-z0-9-]*$/, "SKU faqat harf, raqam va chiziqdan iborat bo'lsin")
    .transform((value) => value.toUpperCase()),
  category: z.enum(["mens", "womens", "kids", "accessories"]),
  size: z.string().trim().max(60).default(""),
  price: nonNegativeNumber,
  stock: z.coerce.number().int("Qoldiq butun son bo'lsin").min(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(20),
  description: optionalText,
});

const orderItemSchema = z.object({
  product: objectId,
  quantity: z.coerce.number().int("Miqdor butun son bo'lsin").min(1),
});

const orderCreateSchema = z.object({
  customer: objectId,
  items: z.array(orderItemSchema).min(1, "Kamida bitta mahsulot kiriting"),
  status: z
    .enum(["new", "processing", "shipped", "completed", "cancelled"])
    .default("new"),
  notes: optionalText,
});

const orderUpdateSchema = z
  .object({
    customer: objectId.optional(),
    items: z.array(orderItemSchema).min(1).optional(),
    status: z
      .enum(["new", "processing", "shipped", "completed", "cancelled"])
      .optional(),
    notes: optionalText.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "O'zgarish kiritilmadi");

const employeeCreateSchema = z.object({
  name: shortText,
  email,
  password,
  phone,
  position: shortText,
  hiredAt: z.coerce.date(),
  salary: nonNegativeNumber,
  address: z.string().trim().max(250).default(""),
  status: z.enum(["active", "inactive"]).default("active"),
});

const employeeUpdateSchema = z.object({
  name: shortText,
  email,
  phone,
  position: shortText,
  hiredAt: z.coerce.date(),
  salary: nonNegativeNumber,
  address: z.string().trim().max(250).default(""),
  status: z.enum(["active", "inactive"]),
});

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  profileSchema,
  customerSchema,
  customerAccountSchema,
  productSchema,
  orderCreateSchema,
  orderUpdateSchema,
  employeeCreateSchema,
  employeeUpdateSchema,
};
