import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1"; // For logging

if (!admin.apps.length) {
  functions.logger.info("adminUtil.ts: Initializing Firebase Admin SDK...");
  admin.initializeApp();
  functions.logger.info("adminUtil.ts: Firebase Admin SDK initialized. App count:", admin.apps.length);
} else {
  functions.logger.info("adminUtil.ts: Firebase Admin SDK already initialized. App count:", admin.apps.length);
}

// Export the initialized admin instance itself
export const adminInstance = admin;
export const db = admin.firestore(); // Convenience export for firestore
