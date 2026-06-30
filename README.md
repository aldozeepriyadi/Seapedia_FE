# Seapedia Frontend

Frontend Seapedia dibuat dengan React, TypeScript, dan Vite.

## Local Development

```bash
npm install
npm run dev
```

Gunakan `.env` seperti ini saat backend jalan lokal:

```env
VITE_API_URL="http://localhost:4100/api"
```

## Deploy ke Vercel

Kalau repository GitHub berisi folder frontend ini langsung, kosongkan Root Directory di Vercel.

Kalau repository GitHub berisi folder `Seapedia_BE_revisi` dan `Seapedia_FE_revisi` dalam satu repo besar, isi Root Directory:

```text
Seapedia_FE_revisi
```

Settings Vercel:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Environment variable production:

```env
VITE_API_URL="https://seapediabe-production.up.railway.app/api"
```

File `vercel.json` dipakai supaya route React seperti `/products`, `/dashboard`, dan `/seller/products` tidak 404 saat halaman di-refresh.
