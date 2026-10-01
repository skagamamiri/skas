/* SK@S DIGITAL V7.1 - Supabase configuration */
window.SKAS_CONFIG = {
  SUPABASE_URL: "https://qscjehhzzigerffaumxa.supabase.co",
  SUPABASE_KEY: "sb_publishable_eUBRXK5PH4RkL4NlX_7a3g_3Gf8YMQY",
  SCHOOL_NAME: "SK@S DIGITAL",
  GOOGLE_DRIVE_WEBAPP_URL: "https://script.google.com/macros/s/AKfycbxPmWmemGCM-L99EfIGO89VFJjLcBmfMgZES3ByAUBRBEue4Yqft8epMejbD0SCOKdj7Q/exec"
};

/* Tukar tajuk modul tanpa mengganggu proses aplikasi. */
(function(){
  function applyPengurusanTitle(){
    const view=document.getElementById('profileView');
    if(!view) return false;
    const hero=view.querySelector('.profile-hero');
    if(!hero) return false;

    const eyebrow=hero.querySelector('div[style*="letter-spacing"]');
    if(eyebrow) eyebrow.remove();

    const heading=hero.querySelector('h2');
    if(heading) heading.textContent='Pengurusan SK@S';

    return true;
  }

  const timer=setInterval(function(){
    if(applyPengurusanTitle()) clearInterval(timer);
  },250);
  setTimeout(function(){clearInterval(timer);},15000);
})();
