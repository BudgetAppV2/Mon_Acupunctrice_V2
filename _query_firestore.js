const fs = require('fs');
const path = require('path');
const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const startIdx = envFile.indexOf('FIREBASE_SERVICE_ACCOUNT=') + 'FIREBASE_SERVICE_ACCOUNT='.length;
let braceCount = 0; let jsonEnd = startIdx;
for (let i = startIdx; i < envFile.length; i++) {
  if (envFile[i] === '{') braceCount++;
  if (envFile[i] === '}') { braceCount--; if (braceCount === 0) { jsonEnd = i + 1; break; } }
}
const sa = JSON.parse(envFile.substring(startIdx, jsonEnd));
const admin = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
admin.initializeApp({ credential: admin.cert(sa) });
const db = getFirestore();
db.collection('contentItems').doc('1PmGO2Yu6aniE2KD9ob9').get().then(d => {
  const data = d.data();
  console.log('userId:', data.userId);
  console.log('title:', data.title);
  console.log('workflowState:', data.workflowState);
  console.log('hasEditorDataV2:', !!data.editorDataV2);
  console.log('keys:', Object.keys(data).join(', '));
  process.exit(0);
}).catch(e => { console.error(e.message); process.exit(1); });
