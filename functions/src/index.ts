// This file simply exports the functions.
// Firebase Admin SDK initialization is handled in adminUtil.ts when it's first imported.

// import * as functions from "firebase-functions/v1";
// We import adminUtil to ensure admin is initialized if any function needs it.
// Even if this simpleHttp function doesn't use db directly,
// it's good practice if other functions in the project will.
// import "./adminUtil"; // This ensures adminUtil.ts runs and initializes admin

import {onCreateUser} from "./onCreateUser";
// import { denormalizeCalendarPermissionsToEvent } from "./denormalizeCalendarPermissionsToEvent";

export {
  onCreateUser,
  // denormalizeCalendarPermissionsToEvent,
};

/**
 * A very simple HTTP function to test basic deployment and execution.
 */
// export const simpleHttp = functions.https.onRequest((request, response) => {
// functions.logger.info("simpleHttp function was triggered!");
// response.send("Hello from a simple Firebase Function!");
// });

// For this test, we are NOT exporting onCreateUser or other functions
// to isolate potential issues.
//
// import { onCreateUser } from "./onCreateUser";
// export { onCreateUser };
