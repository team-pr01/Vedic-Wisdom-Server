import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// ✅ Use path.resolve to find the file from the project root
const serviceAccountPath = path.resolve(process.cwd(), 'secrets/service-account-key.json');

// ✅ Read the file synchronously
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default admin;