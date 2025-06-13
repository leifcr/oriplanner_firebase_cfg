import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK ONCE at the entry point of your functions.
// This ensures it's initialized before any function tries to use it.
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Import functions from their respective TypeScript files.
// Make sure the paths are correct relative to this index.ts file.
// And ensure that the imported files use `export const functionName = ...`
import {onCreateUser} from "./onCreateUser"; // Assuming this file exports 'onCreateUser'
import {denormalizeCalendarPermissionsToEvent} from "./denormalizeCalendarPermissionsToEvent"; // Assuming this file exports 'denormalizeCalendarPermissionsToEvent'

// Export the functions for Firebase to discover.
// The names used here (e.g., onCreateUser) are what Firebase will use
// to identify and trigger the functions.
export {
  onCreateUser,
  denormalizeCalendarPermissionsToEvent,
};

// If you add more functions, you would import their named exports
// and add them to the export block above.
// For example:
// import { anotherFunction } from "./anotherFunctionFile";
// export {
//   onCreateUser,
//   denormalizeCalendarPermissionsToEvent,
//   anotherFunction,
// };
