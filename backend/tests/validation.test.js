const test = require("node:test");
const assert = require("node:assert/strict");
const {
  registerSchema,
  customerSchema,
  productSchema,
  orderCreateSchema,
} = require("../validation/schemas");

test("register kuchli parol va to'liq telefonni qabul qiladi", () => {
  const result = registerSchema.safeParse({
    name: "Test User",
    email: "test@example.com",
    phone: "+998 90 123 45 67",
    password: "StrongPass1",
    company: "",
    city: "Toshkent",
  });
  assert.equal(result.success, true);
});

test("telefon maydoniga matn kiritishni rad etadi", () => {
  const result = customerSchema.safeParse({
    name: "Test User",
    company: "",
    email: "",
    phone: "telefon",
    city: "",
    type: "retailer",
    status: "active",
    notes: "",
  });
  assert.equal(result.success, false);
});

test("mahsulotdagi manfiy qoldiqni rad etadi", () => {
  const result = productSchema.safeParse({
    name: "Test Product",
    sku: "TEST-01",
    category: "mens",
    size: "M",
    price: 1000,
    stock: -1,
    lowStockThreshold: 5,
    description: "",
  });
  assert.equal(result.success, false);
});

test("buyurtmadagi nol miqdorni rad etadi", () => {
  const result = orderCreateSchema.safeParse({
    customer: "507f1f77bcf86cd799439011",
    items: [{ product: "507f1f77bcf86cd799439012", quantity: 0 }],
    status: "new",
    notes: "",
  });
  assert.equal(result.success, false);
});
