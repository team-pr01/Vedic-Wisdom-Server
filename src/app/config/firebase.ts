import * as admin from 'firebase-admin';
import serviceAccount from '../../secrets/service-account-key.json';
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export default admin;