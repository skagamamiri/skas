SK@S Digital V7.6

Versi Supabase dengan diagnostik sambungan. Jika login memaparkan Failed to fetch, klik Uji sambungan untuk melihat status HTTP Supabase.


## V7.7 — Polisi storan
Versi ini menggunakan Google Drive sebagai storan fail eviden. Supabase hanya menyimpan metadata eviden dan URL Google Drive. Medan upload fail Supabase Storage tidak digunakan.


## V7.8
- Edit dan padam eviden mengikut role/RLS.
- Carian eviden diperkemas.
- Google Drive kekal sebagai storan fail; Supabase menyimpan metadata dan pautan.
- V7.6 kekal baseline terkunci; V7.8 ialah pembangunan lanjutan.

## V7.9 Pengurusan Pengguna
- Admin boleh melihat pengguna dan mengubah nama/role.
- Akaun Auth baharu mesti dicipta melalui Supabase Authentication; V7.9 tidak menyimpan Secret/Service Role Key dalam frontend.
- Jalankan `schema-users.sql` SEKALI di Supabase SQL Editor untuk menambah email pada profiles dan polisi update Admin.
