import admin from 'firebase-admin';
import serviceAccount from '../../../service-account.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id, // 👈 ensure project ID is passed explicitly
  });
}

export default admin;
