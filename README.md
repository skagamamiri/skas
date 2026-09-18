# SK@S DIGITAL V6 — Sistem Evidens Digital

Versi V6 meneruskan reka bentuk V5 dengan fokus kepada **pengisian eviden sahaja**.

## Struktur
KEKUATAN KAMI → Aspek → Eviden
1.0 Kepemimpinan → Aspek → Pecahan instrumen → Eviden
2.0 Pengurusan Organisasi → Aspek → Pecahan instrumen → Eviden
3.0 Pengurusan Kurikulum, Kokurikulum dan HEM → Aspek → Pecahan instrumen → Eviden
4.0 Pembelajaran dan Pemudahcaraan (PdPc) → Eviden terus (tiada sub-item dibekalkan)
5.0 Pencapaian Kami → Aspek → Pecahan instrumen → Eviden

## V6
- Tambah eviden dalam fail sebenar: PDF, Word, Excel, PowerPoint, gambar, video dan beberapa format data biasa.
- Fail disimpan dalam IndexedDB pelayar, bukan dalam GitHub.
- Satu eviden boleh dikaitkan dengan lebih daripada satu pecahan instrumen tanpa upload berulang.
- Pautan Google Drive/OneDrive/URL masih boleh digunakan.
- Buka fail eviden terus daripada sistem.
- Padam eviden dan fail tempatan berkaitan.
- Data eviden dipindahkan daripada localStorage V5/V4 secara automatik pada penggunaan pertama.

## Nota penting
V6 masih **local/offline browser storage**. Jika cache/site data browser dipadam atau sistem digunakan pada komputer lain, fail tempatan tidak ikut berpindah. Fasa seterusnya sesuai untuk storan pusat seperti Supabase/Google Drive dan login pengguna.

Tiada modul tindakan, skor, self-score atau skor penilai.
