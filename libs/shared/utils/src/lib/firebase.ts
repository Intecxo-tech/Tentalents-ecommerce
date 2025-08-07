// libs/shared/utils/src/lib/firebase.ts

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT as string
);

const app = initializeApp({
  credential: cert(serviceAccount),
});

export const firebaseAuth = getAuth(app);
