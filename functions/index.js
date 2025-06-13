const admin = require("firebase-admin");

// Initialize Firebase Admin SDK ONCE at the entry point of your functions.
// This ensures it's initialized before any function tries to use it.
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Import functions from their respective files.
// require('./onCreateUser') will return the exports object from onCreateUser.js.
const userFunctions = require("./onCreateUser");
const eventFunctions = require("./denormalizeCalendarPermissionsToEvent");

// Export the functions for Firebase to discover.
// The names used here (e.g., onCreateUser) are what Firebase will use
// to identify and trigger the functions.
exports.onCreateUser = userFunctions.onCreateUser;
exports.denormalizeCalendarPermissionsToEvent = eventFunctions.denormalizeCalendarPermissionsToEvent;

// If you add more functions, you would import and export them here similarly.