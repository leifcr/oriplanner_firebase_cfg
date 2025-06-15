import * as functions from "firebase-functions/v1";
// Import the initialized adminInstance and db from adminUtil
import { adminInstance, db } from "./adminUtil";
import { FieldValue } from "firebase-admin/firestore"; // Import FieldValue for type checking
/**
 * Handles the creation of a new user.
 * Creates a user profile document and a default calendar for the new user.
 */
export const onCreateUser = functions.auth.user().onCreate(async (user: functions.auth.UserRecord): Promise<void> => {
  const { uid, email, displayName } = user;

  functions.logger.log(`New user signed up: UID = ${uid}, Email = ${email}`);
  functions.logger.info(`onCreateUser: adminInstance available: ${!!adminInstance}`);
  functions.logger.info(`onCreateUser: adminInstance.firestore available: ${!!(adminInstance && adminInstance.firestore)}`);
  functions.logger.info(`onCreateUser: adminInstance.firestore.FieldValue available: ${!!(adminInstance && adminInstance.firestore && adminInstance.firestore.FieldValue)}`);

  // Prepare references
  const userDocRef = db.collection("user_profiles").doc(uid);
  const calendarsCollectionRef = db.collection("calendars");

  try {
    // // Explicitly check before use and log
    // if (!adminInstance || !adminInstance.firestore || !adminInstance.firestore.FieldValue) {
    //   const errorMessage = "CRITICAL: adminInstance.firestore.FieldValue is not available before use!";
    //   functions.logger.error(errorMessage, {
    //     adminInstanceExists: !!adminInstance,
    //     firestoreExists: !!(adminInstance && adminInstance.firestore),
    //     fieldValueExists: !!(adminInstance && adminInstance.firestore && adminInstance.firestore.FieldValue),
    //   });
    //   throw new Error("Firebase Admin SDK not properly initialized for FieldValue in onCreateUser.");
    // }

    // Use FieldValue directly from the imported and initialized adminInstance
    // const timestamp = FieldValue.serverTimestamp();
    // functions.logger.info("Timestamp object created (or attempted).");

    const batch = db.batch();

    // 1. Create a user profile document
    batch.set(userDocRef, {
      uid: uid,
      email: email ?? "",
      displayName: displayName ?? "New User",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 2. Create a default (personal) calendar for the user
    const newCalendarRef = calendarsCollectionRef.doc();
    batch.set(newCalendarRef, {
      uid: uid,
      name: "My Calendar",
      isPersonal: true,
      permissions: {
        [uid]: "owner",
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();
    functions.logger.log(`Successfully created user profile and default calendar for UID: ${uid}. Calendar ID: ${newCalendarRef.id}`);
  } catch (error: any) { // Catch as 'any' to access message and stack
    functions.logger.error(`Error in onCreateUser for UID: ${uid}. Message: ${error.message}. Stack: ${error.stack}`, error);
    // It's often good to re-throw if you want Firebase to know the function failed and potentially retry
    // throw error;
  }
});
