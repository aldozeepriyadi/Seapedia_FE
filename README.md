# Seapedia Frontend

Frontend Seapedia adalah aplikasi marketplace modern berbasis React untuk guest, buyer, seller, driver, dan admin. UI dibuat responsif, clean, dan memakai pendekatan workspace/panel untuk halaman operasional.

## Tech Stack

- React 18, TypeScript, Vite
- React Router DOM
- Tailwind CSS
- SweetAlert2 untuk feedback login, logout, checkout, CRUD, dan konfirmasi
- lucide-react untuk icon

## Fitur Utama

- Landing page marketplace dengan search produk seperti marketplace modern.
- Public catalog dengan search, filter, sort, product card, dan product detail.
- Public review form dan review list.
- Auth flow: register, login, logout confirmation, profile, dan active role selection.
- Login form menerima username atau email agar akun demo tetap fleksibel.
- Buyer flow: cart terpisah, checkout terpisah, delivery address di checkout, wallet, order history, dan order detail.
- Seller panel: overview, store, product management modal, order management, dan chart/summary.
- Driver workspace: available jobs, active delivery, history, dan earnings.
- Admin panel: monitoring, overdue handling, voucher management, promo management, datatable, modal, dan SweetAlert.

## Struktur Folder

```text
src/
  App.tsx                 Route map aplikasi
  main.tsx                React entry point
  components/             Layout, navbar, card, form, reusable UI
  context/AuthContext.tsx Auth state, token, role selection
  lib/                    API helper, formatting, alerts
  pages/                  Page-level screens
  types.ts                Shared frontend types
```

## Environment Variables

Buat file `.env` lokal:

```env
VITE_API_URL="http://localhost:4100/api"
```

Untuk production, isi di dashboard Vercel:

```env
VITE_API_URL="https://your-backend.up.railway.app/api"
```

Catatan:

- `VITE_API_URL` memang public karena dipakai browser.
- Jangan taruh `DATABASE_URL`, password Supabase, atau `JWT_SECRET` di frontend.
- `.env.production` tidak perlu di-commit. Gunakan Vercel Environment Variables.

## Local Development

Requirements:

- Node.js 20+
- Backend Seapedia aktif di `http://localhost:4100/api`

Install dan run:

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

URL lokal:

```text
http://127.0.0.1:5173
```

## Scripts

```bash
npm run dev      # run Vite dev server
npm run build    # type-check dan production build
npm run lint     # ESLint
npm run preview  # preview build lokal
```

## Route Map

Public routes:

| Path | Fungsi |
| --- | --- |
| `/` | Landing page dan public review |
| `/products` | Catalog, search, filter, sort |
| `/products/:id` | Product detail dan add to cart |
| `/login` | Login |
| `/register` | Register |

Protected routes:

| Path | Role | Fungsi |
| --- | --- | --- |
| `/choose-role` | Authenticated | Pilih active role |
| `/profile` | Authenticated | Profile user |
| `/dashboard` | Authenticated | Redirect/overview sesuai role |
| `/cart`, `/keranjang` | Buyer | Cart page |
| `/checkout`, `/pembayaran` | Buyer | Checkout dan payment |
| `/orders/:id` | Buyer/Seller | Order detail |
| `/seller` | Seller | Seller overview |
| `/seller/store` | Seller | Store management |
| `/seller/products` | Seller | Product management |
| `/seller/orders` | Seller | Order processing |
| `/driver` | Driver | Driver overview |
| `/driver/available` | Driver | Available jobs |
| `/driver/active` | Driver | Active delivery |
| `/driver/history` | Driver | Job history |
| `/admin` | Admin | Admin overview |
| `/admin/monitoring` | Admin | Marketplace monitoring |
| `/admin/overdue` | Admin | Overdue handling |
| `/admin/vouchers` | Admin | Voucher management |
| `/admin/promos` | Admin | Promo management |

## API Integration

Semua request lewat `src/lib/api.ts`.

- Base URL memakai `VITE_API_URL`.
- Jika env diisi tanpa `/api`, helper otomatis menambahkan `/api`.
- Token dikirim sebagai `Authorization: Bearer <token>`.
- Response error dilempar sebagai `ApiError` supaya UI bisa menampilkan SweetAlert/message.

Auth state disimpan di `AuthContext`:

- Token disimpan di localStorage.
- Login mengirim satu input sebagai username/email ke endpoint `/auth/login`.
- Setelah login/register, user diarahkan memilih active role jika punya lebih dari satu role.
- Logout memanggil backend lalu membersihkan localStorage.

## Deploy Vercel

Jika GitHub repo berisi folder FE langsung:

```text
Root Directory: kosong
```

Jika GitHub repo berisi `Seapedia_BE_revisi` dan `Seapedia_FE_revisi`:

```text
Root Directory: Seapedia_FE_revisi
```

Settings Vercel:

```text
Framework Preset: Vite
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

Environment variable:

```env
VITE_API_URL="https://your-backend.up.railway.app/api"
```

File `vercel.json` berisi rewrite ke `/` supaya client-side route seperti `/products`, `/dashboard`, dan `/seller/products` tidak 404 ketika refresh.

## Troubleshooting

- `Failed to fetch`: cek backend sudah hidup, `VITE_API_URL` benar, dan backend CORS mengizinkan domain Vercel.
- Halaman route 404 setelah refresh: pastikan `vercel.json` ikut ke-commit dan deploy ulang.
- Data kosong di catalog: cek endpoint `/api/products` backend.
- Login berhasil tapi dashboard salah role: masuk ke `/choose-role` dan pilih active role yang sesuai.
- Checkout gagal: cek wallet balance, address, cart item, stock, dan discount code masih aktif.

## Build Check

Sebelum push/deploy:

```bash
npm run build
```
