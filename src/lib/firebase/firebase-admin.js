import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

console.log('outside');
if (!admin.apps.length) {
  console.log('hello');
  const serviceAccount = JSON.parse(
    readFileSync(join(process.cwd(), 'service-account.json'), 'utf8')
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
