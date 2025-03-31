import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import * as serviceAccount from './service-account.json'; // Path to your JSON key

// Initialize Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = getFirestore();
export { db };