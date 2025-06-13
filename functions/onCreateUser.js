const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Firebase Admin SDK is initialized in index.js

const db = admin.firestore();

/**
 * Handles the creation of a new user.
 * Creates a user profile and a default calendar for the new user.
 */
exports.onCreateUser = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName } = user;

  functions.logger.log(`New user signed up: UID = ${uid}, Email = ${email}`);

  // 1. Create a user profile document
  const userProfile = {
    uid: uid, // Unique identifier for the user
    email: email || "",
    displayName: displayName || "", // Empty string if not provided
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    // You can add other default profile fields here
    // e.g., photoURL: user.photoURL || null,
  };

  const userDocRef = db.collection("users").doc(uid);

  // 2. Create a default calendar for the user
  const defaultCalendar = {
    uid: uid, // Link the calendar to the user
    name: "My Calendar", // Default calendar name
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    // You can add other default calendar fields here
    // e.g., color: "#039BE5" (a default color)
  };

  const calendarsCollectionRef = db.collection("calendars");

  try {
    // Using a batch write to ensure both operations succeed or fail together
    const batch = db.batch();

    batch.set(userDocRef, userProfile);
    const newCalendarRef = calendarsCollectionRef.doc(); // Create a new doc reference for the calendar
    batch.set(newCalendarRef, defaultCalendar);

    await batch.commit();

    functions.logger.log(`Successfully created profile and default calendar for UID: ${uid}. Calendar ID: ${newCalendarRef.id}`);

  } catch (error) {
    functions.logger.error(`Error creating profile/calendar for UID: ${uid}`, error);
    // Optionally, you might want to re-throw the error or handle cleanup
    // For example, if user profile creation is critical, and it fails,
    // you might consider if the user account itself should be handled (though auth creation already happened).
  }
});
