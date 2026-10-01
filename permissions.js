/* SK@S DIGITAL - Role permissions
 * Nazir = read-only. Admin/Guru retain existing evidence controls.
 * This UI layer complements the Supabase RLS policies.
 */
(function(){
  'use strict';

  function role(){
    const pill=document.getElementById('userPill');
    const text=(pill?.textContent||'').toLowerCase();
    if(text.includes('· nazir') || /\bnazir\b/.test(text)) return 'nazir';
    if(text.includes('· admin') || /\badmin\b/.test(text)) return 'admin';
    return 'guru';
  }

  function isNazir(){ return role()==='nazir'; }

  function apply(){
    document.documentElement.classList.toggle('role-nazir',isNazir());
  }

  const style=document.createElement('style');
  style.textContent=`
    html.role-nazir #addBtn,
    html.role-nazir .add-mini,
    html.role-nazir #driveUploadBtn,
    html.role-nazir .action-btn{display:none!important}
  `;
  document.head.appendChild(style);

  // Block all UI attempts by Nazir to add, edit or delete evidence.
  document.addEventListener('click',function(e){
    if(!isNazir()) return;
    const target=e.target.closest('#addBtn,.add-mini,#driveUploadBtn,.action-btn,#saveBtn');
    if(!target) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    alert('Akses Nazir adalah paparan sahaja. Nazir tidak boleh menambah, mengedit atau memadam eviden.');
  },true);

  // Protect inline/global calls as an additional client-side layer.
  function wrap(name,message){
    const original=window[name];
    if(typeof original!=='function' || original.__skasNazirWrapped) return;
    const wrapped=function(){
      if(isNazir()){
        alert(message);
        return;
      }
      return original.apply(this,arguments);
    };
    wrapped.__skasNazirWrapped=true;
    wrapped.__skasOriginal=original;
    window[name]=wrapped;
  }

  function wrapFunctions(){
    wrap('addFor','Akses Nazir adalah paparan sahaja. Nazir tidak boleh menambah eviden.');
    wrap('editEvidence','Akses Nazir adalah paparan sahaja. Nazir tidak boleh mengedit eviden.');
    wrap('removeEvidence','Akses Nazir adalah paparan sahaja. Nazir tidak boleh memadam eviden.');
    apply();
  }

  setInterval(wrapFunctions,500);
  wrapFunctions();
})();
