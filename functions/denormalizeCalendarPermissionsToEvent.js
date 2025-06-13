const functions = require("firebase-functions");
const admin = require("firebase-admin");

// admin.initializeApp() should be called once, typically at the top level
// If it's not already there from your onCreateUser function, add it.
// If it is, you don't need to call it again.
// admin.initializeApp();

const db = admin.firestore();

// ... (your existing onCreateUser function if it's in the same file) ...

/**
 * Denormalizes calendar permissions to a new event when it's created.
 * Copies the parent calendar's owner UID and permissions map to the event.
 */
exports.denormalizeCalendarPermissionsToEvent = functions.firestore
  .document("/calendars/{calendarId}/events/{eventId}")
  .onCreate(async (snap, context) => {
    const eventData = snap.data();
    const eventRef = snap.ref;
    const { calendarId, eventId } = context.params;

    functions.logger.log(
      `New event created: ${eventId} in calendar: ${calendarId}. Denormalizing permissions.`
    );

    // 1. Get the parent calendar document
    const calendarRef = db.collection("calendars").doc(calendarId);
    let calendarDoc;
    try {
      calendarDoc = await calendarRef.get();
    } catch (error) {
      functions.logger.error(
        `Error fetching calendar ${calendarId} for event ${eventId}:`,
        error
      );
      return null; // Exit if calendar fetch fails
    }

    if (!calendarDoc.exists) {
      functions.logger.warn(
        `Calendar ${calendarId} not found for event ${eventId}. Cannot denormalize permissions.`
      );
      // Optionally, you could delete the "orphaned" event here,
      // or add a field to the event indicating an issue.
      // For now, we'll just log and exit.
      return null;
    }

    const calendarData = calendarDoc.data();

    // 2. Extract necessary data from the calendar
    //    Assuming calendar has 'uid' for owner and 'permissions' map
    const calendarOwnerId = calendarData.uid;
    const calendarPermissions = calendarData.permissions;

    if (!calendarOwnerId || typeof calendarPermissions !== "object") {
      functions.logger.error(
        `Calendar ${calendarId} is missing 'uid' or 'permissions' map. Event: ${eventId}.`,
        `OwnerID: ${calendarOwnerId}, Permissions type: ${typeof calendarPermissions}`
      );
      // Decide how to handle this: skip update, update with defaults, or log an error state on the event
      return null;
    }

    // 3. Prepare the update for the event document
    const updateData = {
      calendarOwnerIdSnapshot: calendarOwnerId,
      calendarPermissionsSnapshot: calendarPermissions,
      // You might also want to set a 'denormalizedAt' timestamp
      // denormalizedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // 4. Update the event document
    try {
      await eventRef.update(updateData);
      functions.logger.log(
        `Successfully denormalized permissions from calendar ${calendarId} to event ${eventId}.`
      );
    } catch (error) {
      functions.logger.error(
        `Error updating event ${eventId} with denormalized permissions:`,
        error
      );
    }
    return null;
  });

