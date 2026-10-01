/* SK@S DIGITAL - School Information labels override */
(function(){
  'use strict';

  const schoolLabels = [
    ['.profile-hero .profile-user div > div:first-child', 'PROFIL SEKOLAH'],
    ['.profile-hero h2', 'Maklumat Sekolah'],
    ['.profile-hero p', 'Simpan dan urus maklumat rasmi, pengurusan, kurikulum, kokurikulum dan maklumat sekolah anda.'],
    ['.profile-admin-note', 'Maklumat sekolah disimpan di Supabase. Jika ada fail, fail sebenar kekal di Google Drive.'],
    ['#profileModal .tag', 'MAKLUMAT SEKOLAH'],
    ['#profileModal .muted', 'Masukkan satu maklumat sekolah. Fail pilihan boleh dimuat naik ke Google Drive sekolah.'],
    ['#profileUploadModal .tag', 'GOOGLE DRIVE'],
    ['#profileUploadModal h2', 'Upload Fail Maklumat Sekolah'],
    ['#profileUploadModal .muted', 'Fail akan disimpan dalam folder <b>SK@S DIGITAL › MAKLUMAT SEKOLAH</b> dan subfolder kategori akan dicipta secara automatik.']
  ];

  function applySchoolLabels(){
    const view=document.getElementById('profileView');
    if(!view) return;
    schoolLabels.forEach(([selector,text])=>{
      const el=document.querySelector(selector);
      if(!el) return;
      if(selector.includes('profileUploadModal') && selector.includes('.muted')) el.innerHTML=text;
      else el.textContent=text;
    });

    const add=document.getElementById('profileAddBtn');
    if(add) add.textContent='＋ Tambah Maklumat';
    const listTitle=view.querySelector('.panel-head h3');
    if(listTitle) listTitle.textContent='Senarai Maklumat Sekolah';
    const stats=view.querySelectorAll('.profile-stat small');
    if(stats[0]) stats[0].textContent='Jumlah maklumat';
    if(stats[1]) stats[1].textContent='Dengan pautan / fail';
    if(stats[2]) stats[2].textContent='Kategori digunakan';

    const modalTitle=document.getElementById('profileModalTitle');
    if(modalTitle && !modalTitle.textContent.startsWith('Edit')) modalTitle.textContent='Tambah Maklumat Sekolah';

    const form=document.getElementById('profileForm');
    if(form){
      const title=form.querySelector('[name="title"]');
      if(title) title.placeholder='Contoh: Profil Sekolah SK Agama (MIS) Miri';
      const owner=form.querySelector('[name="owner"]');
      if(owner) owner.placeholder='Contoh: Pengurusan Sekolah';
      const note=form.querySelector('[name="note"]');
      if(note) note.placeholder='Catatan atau penerangan maklumat sekolah';
    }
  }

  function watch(){
    applySchoolLabels();
    const obs=new MutationObserver(applySchoolLabels);
    obs.observe(document.body,{childList:true,subtree:true});
    setTimeout(applySchoolLabels,300);
    setTimeout(applySchoolLabels,1000);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',watch);
  else watch();
})();
