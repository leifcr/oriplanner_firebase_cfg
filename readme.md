# Oriplanner Firebase Functions

This repository contains all the cloud functions for the oriplanner ecosystem

## onCreateUser

This creates the initial user profile and initial calendar with these properties

### Basic UserProfile

Document in Firestore UserProfile collection
This document would initially contain:

- uid (from the auth user)
- email (from the auth user)
- createdAt: FieldValue.serverTimestamp()
- updatedAt: FieldValue.serverTimestamp()
- displayName: "" (or null)
- imageUrl: null
- profileSetupPending: true - tells that the user must complete the onboarding/setup

### Initial Calendar

Document in Firestore calendar collection
This will hold all the events for the main calendar for the user

- uid: id from the auth user
- calendarName: "My Calendar" (a temporary default)
- createdAt: FieldValue.serverTimestamp()
- updatedAt: FieldValue.serverTimestamp()
- timeZone: null # Will be set from the app, as it needs to know the current timezone of the user
- color: null # States that color is not set (Might change this to a default color instead)
- imageUrl: null # No image set
- permissions: {uid: "owner"} # initially only with the id of the owner

### Rules
Current rules trigger a get request for every event. that is not ideal, as it doubles the number of requests just to get an event.

### Deploying to firebase:

Only functions to Firebase:
`firebase deploy --only functions`

Only rules
`firebase deploy --only firestore:rules`

# Running the emulators

To ensure data is persisted in the emulators:
```firebase emulators:start --import .\fbexport\ --export-on-exit .\fbexport\```


To always have clean data:
```firebase emulators:start```