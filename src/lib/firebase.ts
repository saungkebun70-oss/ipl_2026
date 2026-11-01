import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore with the custom database ID if specified
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// Test connection on boot according to Firebase integration guidelines
export async function testFirestoreConnection() {
  try {
    // Attempt connection ping
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
  } catch {
    // Connection test handled silently
  }
}
