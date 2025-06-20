import * as functions from "firebase-functions/v1";
// Import the initialized adminInstance and db from adminUtil
import { db } from "./adminUtil";
import { FieldValue } from "firebase-admin/firestore"; // Import FieldValue for type checking
/**
 * Handles the creation of a new user.
 * Creates a user profile document and a default calendar for the new user.
 */
export const onCreateUser = functions.auth.user().onCreate(async (user: functions.auth.UserRecord): Promise<void> => {
  const { uid, email, displayName } = user;

  // functions.logger.log(`New user signed up: UID = ${uid}, Email = ${email}`);

  // Prepare references
  const newUserProfileDocRef = db.collection("user_profiles").doc(uid);
  const newCalendarDocRef = db.collection("calendars").doc(uid);

  try {
    const batch = db.batch();

    // 1. Create a user profile document
    batch.set(newUserProfileDocRef, {
      uid: uid,
      email: email ?? "",
      displayName: displayName ?? "",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 2. Create a default (personal) calendar for the user
    batch.set(newCalendarDocRef, {
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
  } catch (error: any) { // Catch as 'any' to access message and stack
    functions.logger.error(`Error in onCreateUser for UID: ${uid}. Message: ${error.message}. Stack: ${error.stack}`, error);
    // It's often good to re-throw if you want Firebase to know the function failed and potentially retry
    // throw error;
  }
});
