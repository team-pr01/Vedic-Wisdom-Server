import * as admin from 'firebase-admin';

// 1. Parse the JSON string
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountString) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT is not set in .env");
}

const serviceAccount = JSON.parse(serviceAccountString);

// 2. CRITICAL FIX: Replace the literal \n characters with actual line breaks.
// Without this, Firebase will throw "Invalid PEM formatted message"
if (serviceAccount.privateKey) {
  serviceAccount.privateKey = serviceAccount.privateKey.replace(/\\n/g, '\n');
}

// 3. Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default admin;