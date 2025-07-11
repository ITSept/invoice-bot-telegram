# Rasty Invoice Telegram Bot

Bot Telegram ini membantu Anda membuat invoice secara otomatis dengan mudah melalui percakapan di Telegram. Invoice yang dihasilkan berupa file PDF.

## Fitur

- Pembuatan invoice interaktif melalui chat Telegram.
- Menambahkan detail pelanggan (nama, alamat).
- Menambahkan beberapa item produk/layanan dengan kuantitas dan harga satuan.
- Otomatis menghitung subtotal, DP (50%), dan pelunasan.
- Menghasilkan invoice dalam format PDF.
- Pencatatan log pembuatan invoice.

## Persyaratan

Sebelum memulai, pastikan Anda memiliki hal-hal berikut terinstal di sistem Anda:

- **Node.js**: Versi 16 atau lebih tinggi direkomendasikan. Anda bisa mengunduhnya dari [nodejs.org](https://nodejs.org/).
- **npm** (Node Package Manager): Biasanya terinstal otomatis bersama Node.js.
- **Bot Token Telegram**: Dapatkan dari [@BotFather](https://t.me/BotFather) di Telegram.
- **Google Chrome / Chromium**: Puppeteer (library yang digunakan untuk membuat PDF) membutuhkan browser Chromium. Ini biasanya akan diunduh secara otomatis oleh Puppeteer saat instalasi, tetapi pastikan sistem Anda mendukungnya.

## Panduan Instalasi (Lokal)

Ikuti langkah-langkah di bawah ini untuk menyiapkan dan menjalankan bot di komputer lokal Anda:

1.  **Clone Repositori (Jika Anda belum melakukannya):**
    Jika Anda mengunduh proyek ini sebagai ZIP atau meng-*clone* sebelumnya, lewati langkah ini. Jika belum:
    ```bash
    git clone [https://github.com/username/nama-repo-anda.git](https://github.com/username/nama-repo-anda.git)
    cd nama-repo-anda # Masuk ke direktori proyek
    ```
    *(Ganti `https://github.com/username/nama-repo-anda.git` dengan URL repositori Anda yang sebenarnya.)*

2.  **Instal Dependensi:**
    Navigasikan ke direktori proyek di terminal Anda dan jalankan perintah ini untuk menginstal semua *library* yang diperlukan:
    ```bash
    npm install
    ```

3.  **Konfigurasi Variabel Lingkungan (.env):**
    Buat file baru bernama `.env` di *root* direktori proyek Anda (sejajar dengan `package.json`).
    Isi file `.env` dengan token bot Telegram Anda:
    ```
    BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN_HERE
    ```
    Ganti `YOUR_TELEGRAM_BOT_TOKEN_HERE` dengan *token* bot yang Anda dapatkan dari [@BotFather](https://t.me/BotFather).

4.  **Siapkan Template Invoice (Opsional, jika ada perubahan)**:
    Pastikan file `invoice.html` berada di dalam folder `templates` di *root* proyek Anda (misalnya, `rasty-invoice-bot/templates/invoice.html`). Sesuaikan template ini jika Anda ingin mengubah tata letak invoice.

5.  **Jalankan Bot:**
    Setelah semua dependensi terinstal dan `.env` dikonfigurasi, Anda bisa menjalankan bot:
    ```bash
    npm start
    ```
    Bot Anda sekarang akan aktif dan berjalan di komputer lokal Anda.

## Cara Menggunakan Bot

Setelah bot berjalan:

1.  Buka Telegram dan cari bot Anda.
2.  Ketik `/start` atau `/invoice` untuk memulai proses pembuatan invoice.
3.  Ikuti instruksi bot untuk memasukkan nama pelanggan, alamat, dan detail produk/layanan.
4.  Untuk menambahkan produk, gunakan format: `Nama Produk, Jumlah, Harga Satuan` (Contoh: `Box, 150, 1000`).
5.  Setelah selesai menambahkan semua produk, ketik `/selesai` untuk menghasilkan invoice PDF.
6.  Anda dapat membatalkan proses pembuatan invoice kapan saja dengan mengetik `/batal`.

## Catatan Penting untuk Deployment 24/7 (Gratis)

Menjalankan bot secara lokal hanya akan membuatnya aktif selama komputer Anda menyala dan *script* bot berjalan. Untuk membuat bot aktif 24/7, Anda perlu melakukan *deployment* ke *server cloud*.

Berikut adalah beberapa opsi platform gratis yang populer:

1.  **Render (Direkomendasikan untuk Node.js dengan Long Polling):**
    * **Fitur:** Mudah diatur, cocok untuk aplikasi Node.js. Di *free tier*, layanan akan *idle* setelah 15 menit tidak ada lalu lintas (mungkin ada sedikit penundaan pada respon pertama setelah *idle*).
    * **Cara:** Hubungkan repositori GitHub/GitLab Anda, pilih Node.js sebagai *runtime*, dan Render akan secara otomatis menjalankan `npm install` dan `npm start`.

2.  **Vercel (Direkomendasikan untuk Webhook / Serverless Functions):**
    * **Fitur:** Ideal untuk fungsi *serverless* dan sangat efisien karena hanya "aktif" saat menerima *event* (pesan Telegram). Memerlukan sedikit modifikasi kode bot untuk beralih dari *long polling* ke *webhook*.
    * **Cara:** Anda perlu menyesuaikan `app.js` untuk mengekspor fungsi handler HTTP, lalu mengatur *webhook* bot Telegram Anda ke URL Vercel yang di-*deploy*.

3.  **Heroku (Gratis Tier Sangat Terbatas/Tidak Ada):**
    * Dulunya populer untuk *free tier*, namun kebijakannya sudah berubah dan *free tier*-nya sangat terbatas atau tidak lagi tersedia untuk proyek baru.

**Langkah Umum Deployment:**

1.  **Pastikan Kode Anda Sudah di Git (GitHub/GitLab/Bitbucket).**
2.  **Daftar akun** di platform *hosting* pilihan Anda (misalnya Render atau Vercel).
3.  **Hubungkan repositori Git Anda** ke platform *hosting*.
4.  **Konfigurasi Variabel Lingkungan (BOT_TOKEN)** di pengaturan platform *hosting* (jangan di-*hardcode* di kode).
5.  **Mulai proses *deployment***.

Pilih platform yang paling sesuai dengan kenyamanan dan kebutuhan Anda. Render lebih mudah jika Anda ingin tetap menggunakan `bot.launch()` (long polling), sementara Vercel lebih efisien jika Anda bersedia mengadaptasi bot untuk *webhook*.

---

**Cara Menggunakan `README.md` ini:**

1.  Buat file baru bernama `README.md` (pastikan nama dan ekstensi tepat) di *root* direktori proyek Anda (sejajar dengan `package.json`).
2.  Salin dan tempel seluruh konten di atas ke dalam file `README.md` tersebut.
3.  **PENTING**: Ganti `https://github.com/username/nama-repo-anda.git` dengan *URL* repositori GitHub Anda yang sebenarnya di bagian "Clone Repositori".
4.  Simpan file `README.md`.
5.  *Commit* dan *push* file `README.md` ini ke repositori Git Anda:
    ```bash
    git add README.md
    git commit -m "Add README.md with installation guide"
    git push origin main # Atau master, sesuai branch utama Anda
    ```

Sekarang, siapa pun yang mengunjungi repositori Git Anda akan melihat panduan lengkap untuk menginstal dan menggunakan bot Anda!
