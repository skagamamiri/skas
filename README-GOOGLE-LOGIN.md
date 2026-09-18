# SK@S Digital V7.14 — Google Login + Admin Approval

## 1. Jalankan SQL
Di Supabase → SQL Editor, jalankan:

`schema-approval.sql`

SQL ini:
- menambah `profiles.status` = `pending / approved / rejected`;
- mengekalkan akaun sedia ada sebagai `approved`;
- menjadikan pengguna baharu (Google/email) `pending`;
- membenarkan Admin meluluskan/menolak pengguna;
- menyekat eviden daripada akaun yang belum diluluskan.

## 2. Aktifkan Google Provider di Supabase
Supabase → Authentication → Providers → Google → Enable.

Anda perlu Google OAuth Client ID dan Client Secret daripada Google Cloud / Google Auth Platform.

### Google OAuth Client
Jenis aplikasi: **Web application**.

Authorized JavaScript origins:
- URL GitHub Pages SK@S Digital anda.

Authorized redirect URI:
- `https://qscjehhzzigerffaumxa.supabase.co/auth/v1/callback`

Simpan Client ID dan Client Secret ke Google Provider di Supabase.

## 3. Redirect URL Supabase
Supabase → Authentication → URL Configuration.

Pastikan URL GitHub Pages SK@S Digital anda berada dalam **Redirect URLs / Site URL**.

Aplikasi V7.14 menggunakan URL halaman semasa sebagai `redirectTo` selepas Google selesai login.

## 4. Aliran pengguna
1. Pengguna tekan **Daftar / Log masuk dengan Google**.
2. Google authenticate pengguna.
3. Supabase mencipta akaun jika belum wujud.
4. Trigger Supabase mencipta profil dengan status **Menunggu**.
5. Pengguna belum boleh masuk ke dashboard.
6. Admin buka **Pengguna**.
7. Admin tekan **✓ Lulus**.
8. Pengguna boleh login dan menggunakan sistem.

## 5. Role
Admin boleh menetapkan:
- Guru
- Nazir
- Admin

Status:
- Menunggu
- Diluluskan
- Ditolak

## Nota keselamatan
Google OAuth hanya mengesahkan identiti pengguna. Akses ke data SK@S masih dikawal oleh Supabase RLS dan status kelulusan.

Jangan letakkan Supabase Secret/Service Role Key atau Google Client Secret dalam GitHub/frontend.
