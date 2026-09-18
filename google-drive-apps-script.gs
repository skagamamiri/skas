const ROOT_NAME = 'SK@S DIGITAL';
const SHARE_ROOT_WITH_DOMAIN = false; // Tukar kepada true jika mahu seluruh domain sekolah boleh melihat folder.

function doGet(e) {
  const t = HtmlService.createTemplateFromFile('DriveUpload');
  t.targets = e && e.parameter && e.parameter.targets ? e.parameter.targets : encodeURIComponent('[]');
  return t.evaluate()
    .setTitle('SK@S Digital - Upload ke Google Drive')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function uploadEvidence(formObject) {
  if (!formObject || !formObject.file) throw new Error('Fail belum dipilih.');
  const payload = JSON.parse(formObject.payload || '{}');
  const targets = Array.isArray(payload.targets) ? payload.targets : [];
  if (!targets.length) throw new Error('Tiada pecahan instrumen dipilih.');

  const blob = formObject.file;
  if (!blob.getName()) throw new Error('Nama fail tidak dapat dibaca.');

  const root = getOrCreateRoot_();
  const folders = [];
  targets.forEach(t => {
    const folder = ensurePath_(root, Array.isArray(t.drivePath) ? t.drivePath : [String(t.name || t.id)]);
    folders.push({id: folder.getId(), name: folder.getName(), url: folder.getUrl()});
  });

  // Fail asal disimpan sekali dalam folder pertama.
  const mainFolder = DriveApp.getFolderById(folders[0].id);
  const file = mainFolder.createFile(blob);
  const shortcutUrls = [];

  // Jika eviden dikaitkan dengan lebih daripada satu pecahan, buat shortcut
  // pada folder lain supaya fail sebenar tidak diduplikasi.
  for (let i = 1; i < folders.length; i++) {
    const shortcut = DriveApp.createShortcut(file.getId()).moveTo(DriveApp.getFolderById(folders[i].id));
    shortcutUrls.push(shortcut.getUrl());
  }

  return {
    ok: true,
    fileId: file.getId(),
    fileName: file.getName(),
    url: file.getUrl(),
    folderUrl: mainFolder.getUrl(),
    folders: folders,
    shortcuts: shortcutUrls
  };
}

function getOrCreateRoot_() {
  const props = PropertiesService.getScriptProperties();
  const savedId = props.getProperty('SKAS_ROOT_FOLDER_ID');
  if (savedId) {
    try { return DriveApp.getFolderById(savedId); } catch (err) {}
  }
  const it = DriveApp.getFoldersByName(ROOT_NAME);
  let folder = it.hasNext() ? it.next() : DriveApp.createFolder(ROOT_NAME);
  props.setProperty('SKAS_ROOT_FOLDER_ID', folder.getId());
  if (SHARE_ROOT_WITH_DOMAIN) {
    try { folder.setSharing(DriveApp.Access.DOMAIN, DriveApp.Permission.VIEW); } catch (err) {}
  }
  return folder;
}

function ensurePath_(root, parts) {
  let folder = root;
  (parts || []).filter(Boolean).forEach(name => {
    const clean = String(name).trim();
    if (!clean) return;
    const it = folder.getFoldersByName(clean);
    folder = it.hasNext() ? it.next() : folder.createFolder(clean);
  });
  return folder;
}

function setupSKASDrive() {
  const root = getOrCreateRoot_();
  Logger.log('SK@S DIGITAL folder: ' + root.getUrl());
  return root.getUrl();
}
