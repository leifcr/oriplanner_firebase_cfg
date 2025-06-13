import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

// Firebase Admin SDK initialization (admin.initializeApp();)
// is typically done once, often at the root of your index.ts if not already handled.
// If it's not initialized elsewhere, uncomment the line below:
// admin.initializeApp();

const db = admin.firestore();

// Optional: Define interfaces for better type safety
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: admin.firestore.FieldValue;
  updatedAt: admin.firestore.FieldValue;
  // photoURL?: string | null; // Example of an optional field
}

interface DefaultCalendar {
  uid: string; // Owner's UID
  name: string;
  isPersonal?: boolean; // To mark it as the default, non-deletable personal calendar
  permissions?: { [key: string]: string }; // To store owner permission
  createdAt: admin.firestore.FieldValue;
  updatedAt: admin.firestore.FieldValue;
  // color?: string; // Example of an optional field
}

/**
 * Handles the creation of a new user.
 * Creates a user profile and a default calendar for the new user.
 */
export const onCreateUser = functions.auth.user().onCreate(async (user: functions.auth.UserRecord): Promise<void> => {
  const {uid, email, displayName} = user;

  functions.logger.log(`New user signed up: UID = ${uid}, Email = ${email}`);

  // 1. Create a user profile document
  const userProfile: UserProfile = {
    uid: uid, // Unique identifier for the user
    email: email || "",
    displayName: displayName || "New User", // Provide a default if null/undefined
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    // photoURL: user.photoURL || null,
  };

  const userDocRef = db.collection("users").doc(uid);

  // 2. Create a default calendar for the user
  const defaultCalendar: DefaultCalendar = {
    uid: uid, // Link the calendar to the user (owner)
    name: "My Calendar", // Default calendar name
    isPersonal: true, // Mark as personal calendar
    permissions: { // Set the creator as the owner in the permissions map
      [uid]: "owner",
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    // color: "#039BE5",
  };

  const calendarsCollectionRef = db.collection("calendars");

  try {
    // Using a batch write to ensure both operations succeed or fail together
    const batch = db.batch();

    batch.set(userDocRef, userProfile);

    // Create a new doc reference for the calendar.
    // If you want a predictable ID (e.g., based on user UID for their personal calendar),
    // you could do calendarsCollectionRef.doc(uid + "_personal_calendar")
    // For now, we'll use an auto-generated ID.
    const newCalendarRef = calendarsCollectionRef.doc();
    batch.set(newCalendarRef, defaultCalendar);

    await batch.commit();

    functions.logger.log(`Successfully created profile and default calendar for UID: ${uid}. Calendar ID: ${newCalendarRef.id}`);
  } catch (error) {
    functions.logger.error(`Error creating profile/calendar for UID: ${uid}`, error);
    // Consider re-throwing or specific error handling if needed
    // throw error; // if you want the function to explicitly fail
  }
});
