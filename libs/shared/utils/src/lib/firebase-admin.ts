import * as admin from 'firebase-admin';

// 🛡️ Prevent re-initialization in case of hot reloads or multi-imports
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// ✅ Named exports for use in middleware, services, etc.
export const firebaseAdmin = admin;
export const adminAuth = admin.auth();
