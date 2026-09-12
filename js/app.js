const state={instrument:null,evidence:[]};
const $=s=>document.querySelector(s);
const icon={Dokumen:"📄",Gambar:"🖼️",Video:"🎬",Data:"📊","Lain-lain":"📎"};

async function init(){
  state.instrument=await fetch("data/instrument.json").then(r=>r.json());
  state.evidence=JSON.parse(localStorage.getItem("skasEvidenceV1")||"[]");
  $("#schoolName").textContent=state.instrument.app.school;
  buildNav(); render();
}
function save(){localStorage.setItem("skasEvidenceV1",JSON.stringify(state.evidence));}
function buildNav(){
  const nav=$("#nav");
  nav.innerHTML="";
  const groups=[
    ["DASHBOARD",[{id:"dashboard",label:"📊 Dashboard"}]],
    ["INSTRUMEN",state.instrument.sections.map(s=>({id:s.id,label:(s.code==="K"?"🟡 ":s.code==="P"?"🟣 ":"🟢 ")+s.name}))],
  ];
  groups.forEach(([title,items])=>{
    const g=document.createElement("div");g.className="nav-group";
    g.innerHTML=`<div class="nav-label">${title}</div>`;
    items.forEach(it=>{
      const b=document.createElement("button");b.className="nav-btn";b.dataset.id=it.id;b.innerHTML=`<span>${it.label}</span><b>›</b>`;
      b.onclick=()=>{ if(it.id==="dashboard") $("#dashboard").classList.remove("hidden"); window.scrollTo({top:0,behavior:"smooth"}); filterSection(it.id); };
      g.appendChild(b);
    }); nav.appendChild(g);
  });
}
function allAspects(){
  const out=[];
  for(const sec of state.instrument.sections){
    if(sec.aspects) sec.aspects.forEach(a=>out.push({...a,section:sec.name}));
    (sec.standards||[]).forEach(st=>(st.aspects||[]).forEach(a=>out.push({...a,section:sec.name,standard:st.code,standardName:st.name,track:st.track})));
  }
  return out;
}
function render(){
  const e=state.evidence;
  const totalAspects=allAspects().length;
  const covered=new Set(e.map(x=>x.aspect).filter(Boolean)).size;
  const readiness=totalAspects?Math.round(covered/totalAspects*100):0;
  $("#readiness").textContent=readiness+"%";
  $("#totalEvidence").textContent=e.length+" eviden";
  $("#summaryCards").innerHTML=[
    ["Eviden direkodkan",e.length,"Jumlah"],
    ["Aspek mempunyai eviden",covered,`daripada ${totalAspects}`],
    ["Belum ada eviden",Math.max(0,totalAspects-covered),"Perlu tindakan"]
  ].map(x=>`<div class="card"><div class="card-top"><span>${x[2]}</span><span>2026</span></div><strong>${x[1]}</strong></div>`).join("");
  renderProgress();
  renderRecent();
  renderStructure();
}
function renderProgress(){
  const target=$("#sectionProgress");target.innerHTML="";
  state.instrument.sections.forEach(sec=>{
    const aspects=allAspects().filter(a=>a.section===sec.name);
    const have=new Set(state.evidence.filter(e=>e.section===sec.name||aspects.some(a=>a.code===e.aspect)).map(e=>e.aspect)).size;
    const pct=aspects.length?Math.round(have/aspects.length*100):0;
    target.innerHTML+=`<div class="progress-row"><div class="label"><span>${sec.name}</span><b>${pct}%</b></div><div class="bar"><div class="fill" style="width:${pct}%"></div></div></div>`;
  });
}
function renderRecent(){
  const el=$("#recentEvidence"),e=[...state.evidence].sort((a,b)=>(b.date||"").localeCompare(a.date||"")).slice(0,6);
  if(!e.length){el.innerHTML=`<div class="muted">Belum ada eviden. Klik <b>+ Tambah</b> untuk mula.</div>`;return}
  el.innerHTML=e.map(x=>`<div class="evidence-item"><div class="e-icon">${icon[x.category]||"📎"}</div><div><strong>${esc(x.title)}</strong><small>${esc(x.aspect)} ${x.date?"• "+x.date:""}</small></div></div>`).join("");
}
function renderStructure(){
  const el=$("#structure");el.innerHTML="";
  state.instrument.sections.forEach(sec=>{
    const wrap=document.createElement("div");wrap.className="structure-section";
    let body="";
    if(sec.aspects) body=sec.aspects.map(a=>aspectBtn(a,sec.name)).join("");
    (sec.standards||[]).forEach(st=>{
      body+=`<div style="padding:10px 14px 2px;font-size:11px;color:#65778d;font-weight:800">STANDARD ${st.code}${st.track?" — "+st.track:""}: ${st.name}</div>`;
      body+=(st.aspects||[]).map(a=>aspectBtn(a,sec.name,st)).join("");
    });
    wrap.innerHTML=`<div class="structure-head"><strong>${sec.name}</strong><span>${sec.code}</span></div><div class="aspect-list">${body}</div>`;
    el.appendChild(wrap);
  });
}
function aspectBtn(a,section,st){return `<button class="aspect" onclick="showAspect('${escAttr(a.code)}','${escAttr(a.name)}','${escAttr(section)}','${escAttr(st?.code||"")}')">${a.code} · ${a.name}</button>`}
function showAspect(code,name,section,std){
  $("#evidenceModal").classList.remove("hidden");
  $("#modalTitle").textContent=`Eviden — ${code}`;
  const f=$("#evidenceForm");f.reset();f.aspect.value=`${code} – ${name}`;f.owner.value="";
  $("#evidenceModal").dataset.section=section;$("#evidenceModal").dataset.aspect=code;
}
function openAdd(){ $("#evidenceModal").classList.remove("hidden");$("#modalTitle").textContent="Tambah Eviden";$("#evidenceForm").reset(); }
function close(){ $("#evidenceModal").classList.add("hidden"); }
$("#addTop").onclick=openAdd;
$("#assessmentBtn").onclick=()=>alert("Mode Penilaian akan menjadi modul V2: paparan instrumen, skor kendiri, skor penilai dan log penilaian.");
$("#closeModal").onclick=close;$("#cancelModal").onclick=close;
$("#evidenceForm").onsubmit=e=>{
  e.preventDefault();const f=e.target;
  const aspect=f.aspect.value.trim();
  const code=(aspect.match(/^([A-Z]?\d+(?:\.\d+)+|A\d+)/)||[])[1]||aspect;
  const section=state.instrument.sections.find(s=>allAspects().find(a=>a.code===code&&a.section===s.name))?.name||"Pengurusan Kami";
  state.evidence.push({id:Date.now().toString(),title:f.title.value.trim(),category:f.category.value,aspect,owner:f.owner.value.trim(),date:f.date.value,url:f.url.value.trim(),note:f.note.value.trim(),section});
  save();close();render();alert("Eviden berjaya disimpan.");
};
$("#search").oninput=e=>doSearch(e.target.value);
$("#clearSearch").onclick=()=>{$("#search").value="";doSearch("")};
document.addEventListener("keydown",e=>{if(e.key==="Escape"){close();$("#search").focus()}});
$("#resetBtn").onclick=()=>{if(confirm("Padam semua data eviden demo?")){state.evidence=[];save();render();}};
function doSearch(q){
  q=q.trim().toLowerCase();
  if(!q){$("#results").classList.add("hidden");$("#dashboard").classList.remove("hidden");return}
  $("#dashboard").classList.add("hidden");$("#results").classList.remove("hidden");
  const aspects=allAspects().filter(a=>`${a.code} ${a.name} ${a.section} ${a.standardName||""}`.toLowerCase().includes(q));
  const ev=state.evidence.filter(x=>`${x.title} ${x.aspect} ${x.owner} ${x.note}`.toLowerCase().includes(q));
  let html="";
  aspects.slice(0,30).forEach(a=>html+=`<div class="result-card"><span class="badge">${a.code}</span><h3>${esc(a.name)}</h3><p>${esc(a.section)}${a.standardName?" • Standard "+esc(a.standard):""}</p><button class="link" onclick="showAspect('${escAttr(a.code)}','${escAttr(a.name)}','${escAttr(a.section)}','${escAttr(a.standard||"")}')">+ Tambah eviden</button></div>`);
  ev.forEach(x=>html+=`<div class="result-card"><span class="badge">${esc(x.category)}</span><h3>${esc(x.title)}</h3><p>${esc(x.aspect)}${x.owner?" • "+esc(x.owner):""}</p>${x.url?`<a class="link" href="${escAttr(x.url)}" target="_blank" rel="noopener">Buka dokumen ↗</a>`:""}</div>`);
  $("#searchResults").innerHTML=html||`<div class="panel"><div class="muted">Tiada hasil untuk “${esc(q)}”.</div></div>`;
}
function filterSection(id){
  if(id==="dashboard"){render();return}
  const sec=state.instrument.sections.find(s=>s.id===id);if(!sec)return;
  $("#search").value=sec.name;doSearch(sec.name);
}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function escAttr(s=""){return esc(s).replace(/`/g,"&#096;")}
init();
