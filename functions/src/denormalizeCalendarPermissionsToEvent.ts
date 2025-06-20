import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { db } from "./adminUtil"; // Reuse your adminUtil for Firestore access

export const denormalizeCalendarPermissionsToEventOnCreate = onDocumentCreated(
  {
    document: "calendars/{calendarId}/events/{eventId}",
    // region: "europe-west1", // or your preferred region
  },
  async (event) => {
    // Corrected line: event.data is the DocumentSnapshot for onDocumentCreated
    const eventSnapshot = event.data; // event.data is the DocumentSnapshot
    if (!eventSnapshot) {
      logger.warn("No event snapshot data found on event creation.");
      return;
    }
    const eventData = eventSnapshot.data(); // Get the actual data from the snapshot

    const { calendarId, eventId } = event.params;

    logger.info(`New event created: ${eventId} in calendar: ${calendarId}. Denormalizing permissions.`);

    if (!eventData) {
      logger.warn("No event data (from snapshot.data()) found.");
      return;
    }

    // 1. Get the parent calendar document
    const calendarRef = db.collection("calendars").doc(calendarId);
    let calendarDoc;
    try {
      calendarDoc = await calendarRef.get();
    } catch (error) {
      logger.error(`Error fetching calendar ${calendarId} for event ${eventId}:`, error);
      return;
    }

    if (!calendarDoc.exists) {
      logger.warn(`Calendar ${calendarId} not found for event ${eventId}. Cannot denormalize permissions.`);
      return;
    }

    const calendarData = calendarDoc.data();
    const calendarOwnerId = calendarData?.uid;
    const calendarPermissions = calendarData?.permissions;

    if (!calendarOwnerId || typeof calendarPermissions !== "object") {
      logger.error(
        `Calendar ${calendarId} is missing 'uid' or 'permissions' map. Event: ${eventId}.`,
        { calendarOwnerId, calendarPermissionsType: typeof calendarPermissions }
      );
      return;
    }

    // 2. Prepare the update for the event document
    const updateData = {
      calendarOwnerIdSnapshot: calendarOwnerId,
      calendarPermissionsSnapshot: calendarPermissions,
    };

    // 3. Update the event document using the snapshot's ref
    try {
      // Use eventSnapshot.ref to update the document that was just created
      await eventSnapshot.ref.update(updateData);
      logger.info(`Successfully denormalized permissions from calendar ${calendarId} to event ${eventId}.`);
    } catch (error) {
      logger.error(`Error updating event ${eventId} with denormalized permissions:`, error);
    }
  }
);

export const denormalizeCalendarPermissionsToEventOnUpdate = onDocumentUpdated(
  {
    document: "calendars/{calendarId}",
    // region: "europe-west1", // or your preferred region
  },
  async (event) => {
    const beforeSnapshot = event.data?.before;
    const afterSnapshot = event.data?.after;

    if (!beforeSnapshot || !afterSnapshot) {
      logger.warn("Missing before or after snapshot data for calendar update.");
      return;
    }

    const beforeData = beforeSnapshot.data();
    const afterData = afterSnapshot.data();
    const { calendarId } = event.params;

    if (!beforeData || !afterData) {
      logger.warn("Missing before or after data from snapshots for calendar update.");
      return;
    }

    // Only proceed if the permissions field has changed
    const beforePermissions = JSON.stringify(beforeData.permissions || {});
    const afterPermissions = JSON.stringify(afterData.permissions || {});

    // Also check if ownerId (uid) changed, as that should also trigger a denormalization
    const beforeOwnerId = beforeData.uid;
    const afterOwnerId = afterData.uid;

    if (beforePermissions === afterPermissions && beforeOwnerId === afterOwnerId) {
      logger.info(`No change in permissions or ownerId for calendar ${calendarId}, skipping event updates.`);
      return;
    }

    logger.info(`Permissions or ownerId changed for calendar ${calendarId}, updating events...`);

    // Query all events for this calendar
    const eventsRef = db.collection("calendars").doc(calendarId).collection("events");
    const eventsQuerySnap = await eventsRef.get();

    if (eventsQuerySnap.empty) {
      logger.info(`No events found for calendar ${calendarId} to update.`);
      return;
    }

    const batch = db.batch();
    eventsQuerySnap.forEach((eventDoc) => {
      batch.update(eventDoc.ref, {
        calendarPermissionsSnapshot: afterData.permissions, // Use permissions from afterData
        calendarOwnerIdSnapshot: afterData.uid, // Use uid from afterData
      });
    });

    try {
      await batch.commit();
      logger.info(`Updated permissions for ${eventsQuerySnap.size} events in calendar ${calendarId}.`);
    } catch (error) {
      logger.error(`Error committing batch updates for calendar ${calendarId}:`, error);
    }
  }
);
