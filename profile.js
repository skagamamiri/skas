/* SK@S DIGITAL - Modul Profil / Maklumat Sekolah */
(function(){
  'use strict';
  let rows=[];
  let editId=null;
  let uploadResult=null;

  const escP = s => String(s ?? '').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  const escUrl = s => escP(s).replace(/`/g,'&#096;');
  const $p = s => document.querySelector(s);

  const categories=['Profil & Identiti','Pengurusan','Kurikulum','Kokurikulum','Hal Ehwal Murid','Sarana & Prasarana','Lain-lain'];
  const categoryIcons={'Profil & Identiti':'🏫','Pengurusan':'📋','Kurikulum':'📚','Kokurikulum':'🏆','Hal Ehwal Murid':'👨‍👩‍👧‍👦','Sarana & Prasarana':'🏢','Lain-lain':'📌'};

  function injectStyles(){
    if($p('#profileStyles')) return;
    const st=document.createElement('style'); st.id='profileStyles';
    st.textContent=`
      #profileView{padding-bottom:40px}.profile-hero{background:linear-gradient(135deg,#0b3b72,#176ea8);border-radius:22px;padding:24px 26px;color:#fff;display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:20px;box-shadow:0 14px 35px rgba(11,59,114,.16)}
      .profile-hero h2{margin:5px 0 7px;font-size:28px}.profile-hero p{margin:0;color:#dcecff;font-size:13px}.profile-avatar{width:58px;height:58px;border-radius:18px;background:#fff;display:grid;place-items:center;color:#126da5;font-size:28px;font-weight:800;flex:0 0 auto}.profile-user{display:flex;align-items:center;gap:16px}.profile-email{font-size:11px;color:#c7ddf1;margin-top:3px}.profile-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:18px}.profile-stat{background:#fff;border:1px solid #e2eaf1;border-radius:14px;padding:14px 16px}.profile-stat small{display:block;color:#718096;font-size:11px}.profile-stat strong{display:block;color:#0b2b4a;font-size:23px;margin-top:4px}.profile-list{display:grid;gap:10px}.profile-row{background:#fff;border:1px solid #e2eaf1;border-radius:14px;padding:15px 16px;display:grid;grid-template-columns:42px minmax(0,1fr) auto;gap:12px;align-items:center}.profile-icon{width:42px;height:42px;border-radius:12px;background:#edf6ff;display:grid;place-items:center;font-size:20px}.profile-row strong{display:block;color:#0b2b4a;font-size:14px}.profile-row small{display:block;color:#718096;font-size:11px;margin-top:4px;line-height:1.5}.profile-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.profile-empty{background:#fff;border:1px dashed #bfd0df;border-radius:16px;padding:30px;text-align:center;color:#718096}.profile-modal .modal-card{max-width:650px}.profile-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.profile-form-grid .full{grid-column:1/-1}.profile-drive{display:flex;align-items:center;gap:9px;flex-wrap:wrap;background:#f7fafc;border:1px solid #dce7ef;border-radius:10px;padding:10px}.profile-drive-status{font-size:11px;color:#718096}.profile-upload-modal .modal-card{max-width:700px}.profile-upload-frame{width:100%;height:390px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc}.profile-badge{display:inline-flex;align-items:center;padding:4px 8px;border-radius:999px;background:#edf6ff;color:#126da5;font-size:10px;font-weight:700;margin-top:5px}.profile-url{display:inline-block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#126fb1;font-size:11px}.profile-admin-note{font-size:11px;color:#718096;margin-top:6px}@media(max-width:720px){.profile-hero{padding:20px;align-items:flex-start}.profile-hero .primary{white-space:nowrap}.profile-stats{grid-template-columns:1fr}.profile-form-grid{grid-template-columns:1fr}.profile-row{grid-template-columns:42px 1fr}.profile-actions{grid-column:2;justify-content:flex-start}}
    `;
    document.head.appendChild(st);
  }

  function buildUI(){
    if($p('#profileNav')) return;
    injectStyles();
    const dash=document.querySelector('.sidebar .home[data-view="home"]') || document.querySelector('.sidebar .home');
    if(dash){
      const b=document.createElement('button'); b.className='home'; b.id='profileNav'; b.innerHTML='👤 Pengurusan SK@S';
      dash.insertAdjacentElement('afterend',b); b.addEventListener('click',openProfile);
    }
    const main=document.querySelector('main');
    if(!main) return;
    const sec=document.createElement('section'); sec.id='profileView'; sec.className='hidden';
    sec.innerHTML=`
      <div class="profile-hero"><div class="profile-user"><div class="profile-avatar">🏫</div><div><div style="font-size:11px;letter-spacing:.08em;font-weight:700;color:#bfe0ff">PROFIL SEKOLAH</div><h2>Maklumat Sekolah</h2><p>Simpan dan urus maklumat rasmi, pengurusan, kurikulum, kokurikulum dan maklumat sekolah.</p><div id="profileEmail" class="profile-email"></div></div></div><button class="primary" id="profileAddBtn">＋ Tambah Maklumat</button></div>
      <div class="profile-stats" id="profileStats"></div>
      <div class="panel"><div class="panel-head"><div><h3>Senarai Maklumat Sekolah</h3><div class="profile-admin-note">Maklumat sekolah disimpan di Supabase. Jika ada fail, fail sebenar kekal di Google Drive.</div></div><button class="secondary" id="profileRefreshBtn">↻ Segar</button></div><div id="profileList" class="profile-list"></div></div>`;
    const users=document.querySelector('#usersView'); main.insertBefore(sec,users||null);

    const modal=document.createElement('div'); modal.className='modal hidden profile-modal'; modal.id='profileModal';
    modal.innerHTML=`<div class="modal-card"><button class="x" id="profileClose">×</button><span class="tag">MAKLUMAT SEKOLAH</span><h2 id="profileModalTitle">Tambah Maklumat Sekolah</h2><p class="muted">Masukkan satu maklumat sekolah. Fail pilihan boleh dimuat naik ke Google Drive sekolah.</p><form id="profileForm"><div class="profile-form-grid"><label>Nama maklumat<input name="title" required placeholder="Contoh: Profil Sekolah SK Agama (MIS) Miri"></label><label>Kategori<select name="category">${categories.map(c=>`<option>${escP(c)}</option>`).join('')}</select></label><label>Pemilik / Unit<input name="owner" placeholder="Contoh: Pengurusan Sekolah"></label><label>Tarikh<input name="date" type="date"></label><label class="full">Pautan Google Drive<input name="url" type="url" placeholder="Akan diisi automatik selepas upload ke Google Drive"></label><label class="full">Fail maklumat<div class="profile-drive"><button type="button" class="secondary" id="profileUploadBtn">📁 Upload ke Google Drive</button><span id="profileUploadStatus" class="profile-drive-status">Belum ada fail dipilih.</span></div></label><label class="full">Catatan<textarea name="note" rows="4" placeholder="Catatan atau penerangan maklumat sekolah"></textarea></label></div><div class="actions"><button type="button" class="secondary" id="profileCancel">Batal</button><button class="primary" id="profileSave">Simpan Maklumat</button></div></form></div>`;
    document.body.appendChild(modal);

    const up=document.createElement('div'); up.className='modal hidden profile-upload-modal'; up.id='profileUploadModal';
    up.innerHTML=`<div class="modal-card"><button class="x" id="profileUploadClose">×</button><span class="tag">GOOGLE DRIVE</span><h2>Upload Fail Maklumat Sekolah</h2><p class="muted">Fail akan disimpan dalam folder <b>SK@S DIGITAL › MAKLUMAT SEKOLAH</b> dan subfolder kategori akan dicipta secara automatik.</p><iframe class="profile-upload-frame" id="profileUploadFrame" title="Upload maklumat sekolah ke Google Drive"></iframe></div>`;
    document.body.appendChild(up);

    $p('#profileAddBtn').onclick=()=>openProfileModal();
    $p('#profileRefreshBtn').onclick=loadProfile;
    $p('#profileClose').onclick=closeProfileModal;
    $p('#profileCancel').onclick=closeProfileModal;
    $p('#profileUploadClose').onclick=()=>{$p('#profileUploadModal').classList.add('hidden');};
    $p('#profileUploadBtn').onclick=openProfileUpload;
    $p('#profileForm').addEventListener('submit',saveProfile);

    document.addEventListener('click',e=>{
      const nav=e.target.closest('.home,.nav-btn');
      if(nav && nav.id!=='profileNav') hideProfileView();
    });
    window.addEventListener('message',handleUploadMessage);
  }

  function hideProfileView(){
    const v=$p('#profileView'); if(v) v.classList.add('hidden');
    const n=$p('#profileNav'); if(n) n.classList.remove('active');
  }

  function openProfile(){
    ['homeView','detailView','resultsView','usersView','nazirView'].forEach(id=>$p('#'+id)?.classList.add('hidden'));
    $p('#profileView')?.classList.remove('hidden');
    document.querySelectorAll('.home,.nav-btn').forEach(x=>x.classList.remove('active'));
    $p('#profileNav')?.classList.add('active');
    const name=currentProfile?.full_name||currentUser?.email||'Pentadbir / Guru';
    $p('#profileEmail').textContent=`${name} • ${currentProfile?.role||'guru'}`;
    window.scrollTo({top:0,behavior:'smooth'});
    loadProfile();
  }

  async function loadProfile(){
    if(!sb || !currentUser) return;
    try{
      const {data,error}=await sb.from('profile_information').select('*').eq('user_id',currentUser.id).order('created_at',{ascending:false});
      if(error) throw error;
      rows=data||[]; renderProfile();
    }catch(e){
      rows=[]; renderProfile();
      const list=$p('#profileList'); if(list) list.innerHTML=`<div class="profile-empty"><b>Belum dapat memuat Maklumat Sekolah.</b><br><small>${escP(e.message)}</small><br><br><span class="muted">Pastikan schema-profile.sql sudah dijalankan di Supabase.</span></div>`;
    }
  }

  function renderProfile(){
    const total=rows.length, withFile=rows.filter(x=>x.url).length, cats=new Set(rows.map(x=>x.category)).size;
    const st=$p('#profileStats'); if(st) st.innerHTML=`<div class="profile-stat"><small>Jumlah maklumat</small><strong>${total}</strong></div><div class="profile-stat"><small>Dengan pautan / fail</small><strong>${withFile}</strong></div><div class="profile-stat"><small>Kategori digunakan</small><strong>${cats}</strong></div>`;
    const list=$p('#profileList'); if(!list)return;
    if(!rows.length){list.innerHTML=`<div class="profile-empty"><div style="font-size:30px;margin-bottom:8px">🏫</div><b>Belum ada maklumat sekolah.</b><br><small>Klik “＋ Tambah Maklumat” untuk mula mengisi maklumat sekolah.</small></div>`;return;}
    list.innerHTML=rows.map(r=>`<div class="profile-row"><div class="profile-icon">${categoryIcons[r.category]||'📌'}</div><div><strong>${escP(r.title)}</strong><span class="profile-badge">${escP(r.category||'Lain-lain')}</span><small>${escP(r.owner||'Tiada pemilik / unit')}${r.information_date?' • '+escP(r.information_date):''}${r.note?' • '+escP(r.note):''}</small>${r.url?`<a class="profile-url" href="${escUrl(r.url)}" target="_blank" rel="noopener">🔗 ${escP(r.file_name||'Buka pautan Google Drive')} ↗</a>`:''}</div><div class="profile-actions"><button class="link-btn action-btn" onclick="SKASProfile.edit('${escP(r.id)}')">✏️ Edit</button><button class="danger-link action-btn" onclick="SKASProfile.remove('${escP(r.id)}')">🗑️ Padam</button></div></div>`).join('');
  }

  function openProfileModal(id=null){
    editId=id; uploadResult=null;
    const form=$p('#profileForm'); form.reset();
    $p('#profileModalTitle').textContent=id?'Edit Maklumat Sekolah':'Tambah Maklumat Sekolah';
    if(id){
      const r=rows.find(x=>x.id===id); if(!r)return;
      form.title.value=r.title||'';form.category.value=r.category||'Lain-lain';form.owner.value=r.owner||'';form.date.value=r.information_date||'';form.url.value=r.url||'';form.note.value=r.note||'';
      $p('#profileUploadStatus').textContent=r.file_name?`Fail: ${r.file_name}`:(r.url?'Pautan sedia ada.':'Belum ada fail dipilih.');
    }else{
      form.category.value='Profil & Identiti';
      form.owner.value='Pengurusan Sekolah';
      $p('#profileUploadStatus').textContent='Belum ada fail dipilih.';
    }
    $p('#profileModal').classList.remove('hidden');
  }

  function closeProfileModal(){editId=null;uploadResult=null;$p('#profileModal')?.classList.add('hidden');}

  function openProfileUpload(){
    const category=$p('#profileForm').category.value||'Lain-lain';
    const target={id:'SCHOOL_'+category,name:category,pathLabel:`MAKLUMAT SEKOLAH › ${category}`,drivePath:['MAKLUMAT SEKOLAH',category]};
    const base=String(window.SKAS_CONFIG?.GOOGLE_DRIVE_WEBAPP_URL||'').trim();
    if(!base){alert('URL Google Drive Web App belum dikonfigurasi.');return;}
    const url=base+(base.includes('?')?'&':'?')+'targets='+encodeURIComponent(JSON.stringify([target]));
    $p('#profileUploadFrame').src=url;$p('#profileUploadModal').classList.remove('hidden');
  }

  function handleUploadMessage(e){
    const d=e?.data||{};
    if(d.type!=='SKAS_DRIVE_UPLOAD_SUCCESS') return;
    const r=d.result||{}; uploadResult=r;
    const form=$p('#profileForm');
    if(form){form.url.value=r.url||'';}
    const st=$p('#profileUploadStatus'); if(st) st.innerHTML=`<span style="color:#16834a">✓ Upload berjaya: ${escP(r.fileName||'Fail')}</span>`;
    $p('#profileUploadModal')?.classList.add('hidden');
  }

  async function saveProfile(ev){
    ev.preventDefault();
    if(!sb||!currentUser){alert('Sesi pengguna belum tersedia.');return;}
    const form=ev.currentTarget, btn=$p('#profileSave'); btn.disabled=true;btn.textContent='Menyimpan...';
    const payload={title:form.title.value.trim(),category:form.category.value,owner:form.owner.value.trim(),information_date:form.date.value||null,url:form.url.value.trim()||null,note:form.note.value.trim()||null,file_name:uploadResult?.fileName||null};
    try{
      if(editId){const {error}=await sb.from('profile_information').update({...payload,updated_at:new Date().toISOString()}).eq('id',editId);if(error)throw error;}
      else{const {error}=await sb.from('profile_information').insert({user_id:currentUser.id,...payload});if(error)throw error;}
      closeProfileModal(); await loadProfile();
    }catch(e){alert('Gagal menyimpan maklumat sekolah: '+e.message)}finally{btn.disabled=false;btn.textContent='Simpan Maklumat';}
  }

  async function removeProfile(id){
    const r=rows.find(x=>x.id===id); if(!r)return;
    if(!confirm(`Padam maklumat sekolah “${r.title}”?`))return;
    try{const {error}=await sb.from('profile_information').delete().eq('id',id);if(error)throw error;await loadProfile();}catch(e){alert('Gagal memadam: '+e.message)}
  }

  window.SKASProfile={open:openProfile,edit:openProfileModal,remove:removeProfile,refresh:loadProfile};

  function wait(){
    buildUI();
    if($p('#appView')?.classList.contains('hidden') || !currentUser){setTimeout(wait,700);return;}
    const nav=$p('#profileNav'); if(nav && currentProfile) nav.classList.remove('hidden');
  }
  wait();
})();
