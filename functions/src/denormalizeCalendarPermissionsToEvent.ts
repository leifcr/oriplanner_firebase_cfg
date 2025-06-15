// import * as functions from "firebase-functions/v1";
// import {db, adminInstance} from "./adminUtil"; // Assuming you might need full adminInstance here too

// // Firebase Admin SDK initialization (admin.initializeApp();)
// // is typically done once, often at the root of your index.ts if not already handled.
// // If it's not initialized elsewhere, uncomment the line below:
// // admin.initializeApp();

// // const db = admin.firestore();

// // Optional: Define interfaces for better type safety
// interface CalendarData {
//   uid: string; // Owner's UID
//   permissions: { [key: string]: string }; // Permissions map
//   // Add other calendar fields if needed for type checking
//   [key: string]: unknown; // Allow other properties
// }

// interface EventDenormalizationUpdate {
//   calendarOwnerIdSnapshot: string;
//   calendarPermissionsSnapshot: { [key: string]: string };
//   // denormalizedAt?: admin.firestore.FieldValue; // Optional timestamp
// }

// /**
//  * Denormalizes calendar permissions to a new event when it's created.
//  * Copies the parent calendar's owner UID and permissions map to the event.
//  */
// export const denormalizeCalendarPermissionsToEvent = functions.firestore
//   .document("/calendars/{calendarId}/events/{eventId}")
//   .onCreate(async (snap, context) => {
//     if (!snap) {
//       functions.logger.error("Event snapshot is undefined. Cannot denormalize permissions.");
//       return null;
//     }

//     // const eventData = snap.data(); // eventData is not directly used, snap.ref is used.
//     const eventRef = snap.ref;
//     const {calendarId, eventId} = context.params;

//     functions.logger.log(
//       `New event created: ${eventId} in calendar: ${calendarId}. Denormalizing permissions.`
//     );

//     // 1. Get the parent calendar document
//     const calendarRef = db.collection("calendars").doc(calendarId);
//     let calendarDoc: admin.firestore.DocumentSnapshot;
//     try {
//       calendarDoc = await calendarRef.get();
//     } catch (error) {
//       functions.logger.error(
//         `Error fetching calendar ${calendarId} for event ${eventId}:`,
//         error
//       );
//       return null; // Exit if calendar fetch fails
//     }

//     if (!calendarDoc.exists) {
//       functions.logger.warn(
//         `Calendar ${calendarId} not found for event ${eventId}. Cannot denormalize permissions.`
//       );
//       return null;
//     }

//     const calendarData = calendarDoc.data() as CalendarData | undefined; // Cast to CalendarData or undefined

//     if (!calendarData) {
//       functions.logger.error(
//         `Calendar data for ${calendarId} is undefined. Event: ${eventId}.`
//       );
//       return null;
//     }

//     // 2. Extract necessary data from the calendar
//     const calendarOwnerId = calendarData.uid;
//     const calendarPermissions = calendarData.permissions;

//     if (!calendarOwnerId || typeof calendarPermissions !== "object" || calendarPermissions === null) {
//       functions.logger.error(
//         `Calendar ${calendarId} is missing 'uid' or 'permissions' map, or permissions is not an object. Event: ${eventId}.`,
//         `OwnerID: ${calendarOwnerId}, Permissions type: ${typeof calendarPermissions}`
//       );
//       return null;
//     }

//     // 3. Prepare the update for the event document
//     const updateData: EventDenormalizationUpdate = {
//       calendarOwnerIdSnapshot: calendarOwnerId,
//       calendarPermissionsSnapshot: calendarPermissions,
//       // denormalizedAt: admin.firestore.FieldValue.serverTimestamp(), // Optional
//     };

//     // 4. Update the event document
//     try {
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       await eventRef.update(updateData as { [key: string]: any });
//       functions.logger.log(
//         `Successfully denormalized permissions from calendar ${calendarId} to event ${eventId}.`
//       );
//     } catch (error) {
//       functions.logger.error(
//         `Error updating event ${eventId} with denormalized permissions:`,
//         error
//       );
//     }
//     return null; // Explicitly return null for successful completion or handled errors
//   });
