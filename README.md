SK@S Digital V7.13

Fungsi baharu: upload fail terus dari web ke Google Drive melalui Google Apps Script Web App. Folder akan dicipta automatik mengikut Standard > Aspek > Pecahan instrumen. Jika satu eviden dikaitkan dengan beberapa pecahan, fail asal disimpan sekali dan shortcut diletakkan pada folder pecahan lain. Supabase hanya menyimpan metadata dan URL Drive.

SETUP GOOGLE DRIVE
1. Buka https://script.google.com/create menggunakan akaun Google sekolah yang akan menjadi pemilik storan.
2. Cipta project baharu.
3. Masukkan kandungan google-drive-apps-script.gs sebagai Code.gs.
4. Tambah HTML file bernama DriveUpload dan masukkan kandungan DriveUpload.html.
5. Simpan dan jalankan fungsi setupSKASDrive sekali untuk memberi kebenaran Google Drive.
6. Deploy > New deployment > Web app. Execute as: Me. Who has access: pilih akses yang sesuai dengan akaun sekolah (untuk ujian boleh guna Anyone, tetapi untuk penggunaan sekolah sebaiknya gunakan pilihan domain/akaun yang sesuai).
7. Salin URL /exec deployment.
8. Masukkan URL itu ke config.js pada GOOGLE_DRIVE_WEBAPP_URL.
9. Deploy semula GitHub Pages.

NOTA KESELAMATAN
- Web app ini berjalan sebagai pemilik/deployer jika memilih Execute as Me, jadi fail guru disimpan ke Drive akaun tersebut. Google mendokumentasikan bahawa web app yang execute as owner berjalan di bawah identiti pemilik.
- Jangan letakkan Secret/Service Role Key Supabase dalam frontend.
- Untuk akses fail oleh Nazir/guru lain, kongsi folder root SK@S DIGITAL kepada akaun/kumpulan sekolah. Kod backend tidak menjadikan fail awam secara automatik.
- Apps Script menggunakan DriveApp dan memerlukan kebenaran Drive.


### V7.13 — pembaikan auto-isi pautan Google Drive
Selepas upload berjaya, Google Apps Script menghantar keputusan ke tetingkap utama menggunakan `window.top.postMessage()`. Ini penting kerana halaman Apps Script berjalan dalam sandbox iframe; pautan fail Google Drive kini diisi terus ke medan **Pautan Google Drive** dalam borang eviden. Folder automatik V7.12 dikekalkan.

## V7.14 — Google Login + Admin Approval
Rujuk `README-GOOGLE-LOGIN.md` dan jalankan `schema-approval.sql` sekali di Supabase.
