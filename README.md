# Web Security Lab

Aplikasi edukasi untuk mempelajari kerentanan web umum (OWASP Top 10 inti) dengan implementasi **before** (rentan) dan **after** (aman) berdampingan untuk tiap modul:

- CSRF
- XSS (stored & reflected)
- SQL Injection
- Broken Authentication & Session Management
- IDOR / Broken Access Control
- Security Misconfiguration

## Struktur

- `backend/` — ASP.NET Core Web API (.NET 10), EF Core + SQL Server, cookie-based auth (Identity).
- `frontend/web-security-lab/` — Next.js App Router (TypeScript), memanggil backend langsung dari browser.

## Menjalankan

### 1. Database

Siapkan SQL Server (lokal, Docker, atau instance lain).

Default connection string di `appsettings.json` memakai Windows Authentication (tanpa password):

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=WebSecurityLab;Trusted_Connection=True;TrustServerCertificate=True"
}
```

Jika memakai SQL login (user + password), **jangan tulis password di `appsettings*.json`**. Simpan lewat
[User Secrets](https://learn.microsoft.com/aspnet/core/security/app-secrets) (tersimpan di luar folder project,
hanya dibaca saat environment `Development`):

```powershell
cd backend/WebSecurityLab.Api
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Database=WebSecurityLab;User Id=<user>;Password=<password>;TrustServerCertificate=True"
dotnet user-secrets list   # verifikasi
```

Untuk server/production, gunakan environment variable `ConnectionStrings__DefaultConnection`
atau secret manager (mis. Azure Key Vault).

Lalu jalankan migration. `dotnet ef` tidak membaca `launchSettings.json`, jadi set environment ke
`Development` dulu agar User Secrets ikut terbaca:

```powershell
cd backend/WebSecurityLab.Api
$env:ASPNETCORE_ENVIRONMENT = "Development"
dotnet ef migrations list     # cek status migration (Pending / sudah diterapkan)
dotnet ef database update
```

Jika model berubah, buat migration baru dengan `dotnet ef migrations add <NamaPerubahan>` lalu jalankan
`dotnet ef database update` lagi.

### 2. Backend

```bash
cd backend/WebSecurityLab.Api
dotnet run
```

Backend berjalan di `https://localhost:7254` (dan `http://localhost:5039`).

### 3. Frontend

```bash
cd frontend/web-security-lab
npm install
npm run dev
```

Frontend berjalan di `http://localhost:3000`. Variabel `NEXT_PUBLIC_API_URL` (di `.env.local`) menunjuk ke backend.

## Catatan Keamanan

Backend ini **sengaja** memiliki endpoint rentan (`/api/*/vulnerable/...`) untuk keperluan pembelajaran. Jangan deploy ke internet publik — jalankan hanya di localhost atau environment lab yang terisolasi.

## Menambah Modul Baru

1. Backend: buat folder baru di `Modules/<NamaModul>/` berisi `VulnerableController.cs` dan `SecureController.cs` dengan route prefix `/api/<nama-modul>/vulnerable` dan `/secure`.
2. Frontend: buat komponen `components/<NamaModul>Demo.tsx` yang menerima prop `mode: Mode`, lalu buat halaman `app/<nama-modul>/before/page.tsx` dan `app/<nama-modul>/after/page.tsx` yang merender komponen tersebut. Tambahkan entri ke `lib/modules.ts` agar muncul di halaman utama.
