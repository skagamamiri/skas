let DATA, EVIDENCE=JSON.parse(localStorage.getItem("skasEvidenceV4")||"[]");
const $=s=>document.querySelector(s), esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const escA=s=>esc(s).replace(/`/g,"&#096;");
const icons={Dokumen:"📄",Gambar:"🖼️",Video:"🎬",Data:"📊","Lain-lain":"📎"};

async function init(){
 DATA=await fetch("data/instrument.json").then(r=>r.json());
 $("#school").textContent=DATA.school;
 buildNav(); renderHome(); fillTarget();
}
function allTargets(){
 const a=[];
 DATA.standards.forEach(s=>{
  if(s.direct) a.push({id:s.code,name:s.name,path:s.code});
  (s.aspects||[]).forEach(x=>{
   (x.items||[]).forEach(i=>a.push({id:i[0],name:i[1],path:`${s.code} › ${x.code} ${x.name}`}));
   (x.subaspects||[]).forEach(sa=>{
    (sa.items||[]).forEach(i=>a.push({id:i[0],name:i[1],path:`${s.code} › ${x.code} ${x.name} › ${sa.code} ${sa.name}`}));
   });
  });
 });
 return a;
}
function evidenceFor(id){return EVIDENCE.filter(e=>e.targetId===id)}
function buildNav(){
 let n=$("#nav");
 DATA.standards.forEach(s=>{
  let b=document.createElement("button");b.className="nav-btn";b.innerHTML=`<span>${s.code} · ${esc(s.name)}</span><b>›</b>`;
  b.onclick=()=>openStandard(s.code);n.appendChild(b);
 });
 $(".home").onclick=()=>show("home");
}
function show(v){
 $("#homeView").classList.toggle("hidden",v!=="home");
 $("#detailView").classList.toggle("hidden",v!=="detail");
 $("#resultsView").classList.toggle("hidden",v!=="results");
 document.querySelectorAll(".home,.nav-btn").forEach(x=>x.classList.remove("active"));
 if(v==="home") $(".home").classList.add("active");
 window.scrollTo({top:0,behavior:"smooth"});
}
function renderHome(){
 $("#count").textContent=EVIDENCE.length;
 const targets=allTargets(),covered=new Set(EVIDENCE.map(e=>e.targetId)).size;
 $("#stats").innerHTML=[
  ["Jumlah eviden",EVIDENCE.length],
  ["Pecahan sudah ada eviden",covered],
  ["Pecahan belum ada eviden",Math.max(0,targets.length-covered)]
 ].map(x=>`<div class="stat"><small>${x[0]}</small><strong>${x[1]}</strong></div>`).join("");
 $("#progress").innerHTML=DATA.standards.map(s=>{
  const ts=targets.filter(t=>t.path.startsWith(s.code+" "));
  const have=new Set(EVIDENCE.filter(e=>ts.some(t=>t.id===e.targetId)).map(e=>e.targetId)).size;
  const pct=ts.length?Math.round(have/ts.length*100):0;
  return `<div class="progress"><div class="progress-head"><span>${s.code} · ${esc(s.name)}</span><b>${pct}%</b></div><div class="bar"><div class="fill" style="width:${pct}%"></div></div></div>`
 }).join("");
 const rec=[...EVIDENCE].sort((a,b)=>(b.date||"").localeCompare(a.date||"")).slice(0,8);
 $("#recent").innerHTML=rec.length?rec.map(e=>`<div class="recent"><div class="ico">${icons[e.category]||"📎"}</div><div><strong>${esc(e.title)}</strong><small>${esc(e.targetLabel)} ${e.date?"• "+e.date:""}</small></div></div>`).join(""):`<div class="muted">Belum ada eviden. Gunakan butang “Tambah Eviden” untuk mula.</div>`;
}
function openStandard(code){
 const s=DATA.standards.find(x=>x.code===code); if(!s)return;
 let body="";
 if(s.direct){
  const cnt=evidenceFor(s.code).length;
  body=`<div class="direct"><span class="tag">${s.code}</span><h2>${esc(s.name)}</h2><p class="muted">Eviden boleh direkodkan terus pada Standard 4.0. Pecahan dalaman tidak diberikan dalam senarai struktur yang dibekalkan.</p><div class="item"><div class="item-text">📁 Eviden Standard 4.0</div><div><span class="evidence-count">${cnt} eviden</span> <button class="add-mini" onclick="addFor('${s.code}','${escA(s.name)}')">+ Eviden</button></div></div><div class="evidence-list">${renderEvidence(s.code)}</div></div>`;
 }else{
  body=(s.aspects||[]).map(a=>{
   let items=(a.items||[]).map(i=>itemHtml(i,s,a)).join("");
   if(a.subaspects) items=a.subaspects.map(sa=>`<div class="aspect-card"><div class="aspect-head"><b>${sa.code} · ${esc(sa.name)}</b><small>${sa.items.length} pecahan</small></div>${sa.items.map(i=>itemHtml(i,s,sa)).join("")}</div>`).join("");
   return `<div class="aspect-card"><div class="aspect-head"><b>${a.code} · ${esc(a.name)}</b><small>${a.subaspects?a.subaspects.length+" bahagian":(a.items||[]).length+" pecahan"}</small></div>${items}</div>`;
  }).join("");
 }
 $("#detail").innerHTML=`<div class="title"><div><span>${s.code}</span><h2>${esc(s.name)}</h2></div></div>${body}`;
 show("detail");
}
function itemHtml(i,s,parent){
 const id=i[0],cnt=evidenceFor(id).length;
 return `<div class="item"><div class="item-text"><span class="item-code">${id}</span>${esc(i[1])}</div><div><span class="evidence-count">${cnt} eviden</span> <button class="add-mini" onclick="addFor('${escA(id)}','${escA(i[1])}')">+ Eviden</button></div></div>`;
}
function renderEvidence(id){
 const ev=evidenceFor(id);
 return ev.length?ev.map(e=>`<div class="evidence-row"><strong>${icons[e.category]||"📎"} ${esc(e.title)}</strong><small>${esc(e.owner||"Tiada pemilik")} ${e.date?"• "+e.date:""}${e.note?" • "+esc(e.note):""}</small>${e.url?`<a href="${escA(e.url)}" target="_blank" rel="noopener">Buka dokumen ↗</a>`:""}</div>`).join(""):`<div class="muted">Belum ada eviden untuk pecahan ini.</div>`;
}
function fillTarget(){
 const opts=allTargets();
 $("#target").innerHTML=opts.map(t=>`<option value="${escA(t.id)}">${esc(t.id)} — ${esc(t.name)}</option>`).join("");
}
function addFor(id,label){openModal(id,label)}
function openModal(id="",label=""){
 $("#modal").classList.remove("hidden");
 $("#form").reset();
 if(id) $("#target").value=id;
 $("#modal").dataset.targetLabel=label||$("#target").selectedOptions[0]?.text||"";
}
function closeModal(){$("#modal").classList.add("hidden")}
$("#addBtn").onclick=()=>openModal();
$("#close").onclick=closeModal;$("#cancel").onclick=closeModal;
$("#form").onsubmit=e=>{
 e.preventDefault();const f=e.target,id=f.target.value,op=$("#target").selectedOptions[0]?.text||id;
 EVIDENCE.push({id:Date.now().toString(),targetId:id,targetLabel:op,title:f.title.value.trim(),category:f.category.value,owner:f.owner.value.trim(),date:f.date.value,url:f.url.value.trim(),note:f.note.value.trim()});
 localStorage.setItem("skasEvidenceV4",JSON.stringify(EVIDENCE));closeModal();renderHome(); if(!$("#detailView").classList.contains("hidden")){const code=id.split(".").slice(0,2).join(".");openStandard(DATA.standards.some(s=>s.code===id)?id:(code==="1.1"?"1.0":code==="1.2"?"1.0":code==="1.3"?"1.0":code==="2.1"||code==="2.2"||code==="2.3"||code==="2.4"||code==="2.5"||code==="2.6"||code==="2.7"?"2.0":code.startsWith("3.")?"3.0":"5.0"));}else show("home");};
$("#back").onclick=()=>show("home");
$("#clear").onclick=()=>{$("#search").value="";doSearch("")};
$("#search").oninput=e=>doSearch(e.target.value);
function doSearch(q){
 q=q.trim().toLowerCase(); if(!q){show("home");return}
 show("results");const targets=allTargets();
 const matches=targets.filter(t=>`${t.id} ${t.name} ${t.path}`.toLowerCase().includes(q));
 const ev=EVIDENCE.filter(e=>`${e.title} ${e.targetLabel} ${e.owner} ${e.note}`.toLowerCase().includes(q));
 let h="";
 matches.forEach(t=>h+=`<div class="result"><span class="tag">${esc(t.id)}</span><h3>${esc(t.name)}</h3><p>${esc(t.path)} • ${evidenceFor(t.id).length} eviden</p><button onclick="addFor('${escA(t.id)}','${escA(t.name)}')">+ Tambah eviden</button></div>`);
 ev.forEach(e=>h+=`<div class="result"><span class="tag">${esc(e.category)}</span><h3>${esc(e.title)}</h3><p>${esc(e.targetLabel)}${e.owner?" • "+esc(e.owner):""}</p>${e.url?`<a href="${escA(e.url)}" target="_blank" rel="noopener">Buka dokumen ↗</a>`:""}</div>`);
 $("#results").innerHTML=h||`<div class="panel"><div class="muted">Tiada hasil untuk “${esc(q)}”.</div></div>`;
}
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
init();
