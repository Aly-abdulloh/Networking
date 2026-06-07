# Atlas Tekstil CRM

Kiyim-kechak savdosi uchun mijozlar, mahsulotlar, buyurtmalar va xodimlarni boshqarish tizimi.

## Texnologiyalar

- Frontend: Next.js 16, React 19, Tailwind CSS, shadcn/Radix UI, Recharts, Lucide React
- Backend: Express, MongoDB, Mongoose, Zod
- Xavfsizlik: JWT HttpOnly cookie, bcrypt, Helmet, CORS credentials, rate limiting, RBAC

## Rolelar

| Role | Imkoniyatlar |
|---|---|
| Admin | Barcha bo'limlar, xodimlar va to'liq CRUD |
| Xodim | Mijozlar, mahsulot qoldig'i va buyurtmalarni boshqarish |
| Mijoz | O'z profili, buyurtmalari va xarid qilingan mahsulotlari |

## Ishga tushirish

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

`backend/.env` ichida MongoDB, JWT va boshlang'ich admin qiymatlarini kiriting. `npm run seed` mavjud biznes ma'lumotlarini o'chirmaydi.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend `http://localhost:3000`, API `http://localhost:5000` manzilida ishlaydi.

## Docker orqali lokal ishga tushirish

```bash
cp .env.docker.example .env.docker
docker compose up --build -d
docker compose ps
```

Ilova `http://localhost` manzilida Nginx orqali ochiladi. MongoDB faqat ichki Docker tarmog'ida ishlaydi va uning ma'lumotlari `mongo_data` volume'ida saqlanadi.

```bash
docker compose logs -f
docker compose down
docker compose down -v
```

`docker compose down -v` MongoDB volume'ini ham o'chiradi.

## Tekshiruv

```bash
cd backend
npm test
npm audit --omit=dev

cd ../frontend
npm run build
npm audit --omit=dev
```

Productionda frontend va API'ni bir domen ostida reverse proxy orqali ishlatish, `NODE_ENV=production`, kuchli `JWT_SECRET` va maxfiy admin parolini o'rnatish tavsiya etiladi.
