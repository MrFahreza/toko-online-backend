Backend API - Toko Online Sederhana

Ini adalah layanan API backend untuk "Test Project: Mobile App Toko Online Sederhana". Backend ini dibangun menggunakan NestJS, Prisma, dan database PostgreSQL untuk menyediakan API yang aman, real-time, dan skalabel. Backend ini tidak hanya memenuhi semua spesifikasi fungsional, tetapi juga mencakup beberapa improvement production grade untuk menunjukkan arsitektur yang matang.

🚀 Fitur Utama
Fungsional (Sesuai Spesifikasi)
- Autentikasi & Otorisasi: Sistem login berbasis JWT penuh dengan Role Based Access Control (RBAC) untuk 3 peran: PEMBELI, CS1, dan CS2.
- Manajemen Produk: Operasi CRUD penuh pada produk, dilindungi oleh role CS.
- Manajemen Keranjang: Logika keranjang yang aman dan terisolasi per pengguna (PEMBELI).
- Alur Pesanan Lengkap: Logika transaksi penuh mulai dari checkout, upload-proof, approve-payment (termasuk pengurangan stok), reject-payment, update-status (DIKIRIM, SELESAI), hingga pembeli mengonfirmasi pesanan.
- Dokumentasi API: Dokumentasi API Swagger (OpenAPI) yang dibuat secara otomatis.

Fitur Tambahan (Improvement)
- Notifikasi Real time (WebSocket): Menggunakan NestJS Gateway (Socket.io) untuk mendorong (push) notifikasi ke client (Flutter) secara instan.
- Pembeli mendapat pembaruan status (status_update) secara real time.
- CS1 dan CS2 mendapat notifikasi tugas baru (new_task) saat pesanan masuk ke antrean mereka.
- Auto Cancel Proaktif (Cron Job): Menggunakan NestJS Schedule (@Cron) untuk menjalankan job setiap 5 menit yang secara proaktif membatalkan pesanan yang kedaluwarsa, alih-alih mengecek saat di-load.
- Membatalkan pesanan MENUNGGU_UPLOAD_BUKTI yang lebih dari 24 jam.
- Membatalkan pesanan MENUNGGU_VERIFIKASI_CS1 yang lebih dari 24 jam.
- Respon API Standar: Menggunakan Global Interceptor untuk memastikan semua respon sukses dari API memiliki format yang konsisten ({ statusCode, message, data }).
- Validasi Input: Menggunakan DTO class-validator untuk semua endpoint guna memastikan integritas data dan error handling yang bersih.

🛠️ Tech Stack
- Framework: NestJS
- ORM: Prisma
- Database: PostgreSQL (Dihosting di Supabase)
- Autentikasi: JWT (Passport.js, @nestjs/jwt)
- Real-time: WebSockets (@nestjs/websockets, Socket.io)
- Scheduling: NestJS Schedule (@nestjs/schedule)
- Validasi: class-validator, class-transformer
- Dokumentasi: Swagger (@nestjs/swagger)

⚙️ Instalasi dan Menjalankan
1. Prasyarat
- Node.js (v18 atau lebih baru)
- NPM
- Koneksi ke database PostgreSQL

2. Kloning Repository
- git clone https://github.com/MrFahreza/toko-online-backend.git
- cd toko-online-backend

3. Instalasi Dependensi
- npm install

4. Setup Environment Variables  
Buat file baru bernama .env di root proyek (toko-online-backend/.env). Salin konten di bawah ini dan isi nilainya sesuai dengan kredensial database.
File: .env

DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true"

DIRECT_URL="postgresql://[USER]:[PASSWORD]@[HOST]:5432/postgres"
JWT_SECRET="RAHASIA-SAYA-YANG-SANGAT-KUAT-DAN-PANJANG-123!"

5. Setup Database (Migrasi & Seed)
- Perintah ini akan membuat semua tabel di database   
npx prisma migrate dev

- Perintah ini akan mengisi database dengan akun default dan data produk  
npx prisma db seed

6. Jalankan Server Development  
npm run start:dev

- Server akan berjalan di http://localhost:3000
- Dokumentasi Swagger akan tersedia di http://localhost:3000/docs

🧪 Akun Default (Testing)  
Setelah menjalankan npx prisma db seed, dapat menggunakan akun berikut untuk menguji berbagai peran di Swagger:
* Pembeli
Email : pembeli@example.com
Password : password123

* CS Layer 1
Email : cs1@example.com
Password : password123

* CS Layer 2
Email : cs2@example.com
Password : password123

Cara Menggunakan Token di Swagger:  
- Buka POST /auth/login dan login menggunakan salah satu akun di atas.  
- Salin access_token dari respons.  
- Klik tombol "Authorize" 🔒 di kanan atas halaman.  
- Tempelkan token dengan format: Bearer <token>.  
- Klik "Authorize". Sekarang dapat menguji endpoint yang dilindungi.