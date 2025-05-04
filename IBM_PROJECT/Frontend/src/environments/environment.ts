export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "REPLACE_WITH_FIREBASE_API_KEY",
    authDomain: "REPLACE_WITH_FIREBASE_AUTH_DOMAIN",
    databaseURL: "REPLACE_WITH_FIREBASE_DATABASE_URL",
    projectId: "REPLACE_WITH_FIREBASE_PROJECT_ID",
    storageBucket: "REPLACE_WITH_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "REPLACE_WITH_FIREBASE_MESSAGING_SENDER_ID",
    appId: "REPLACE_WITH_FIREBASE_APP_ID",
    measurementId: "REPLACE_WITH_FIREBASE_MEASUREMENT_ID"
  },
  apiBaseUrl: "REPLACE_WITH_FASTAPI_URL"
};
// Note: Replace the placeholders with actual values before using this configuration.
// This is a template for local development. Make sure to create a separate environment file for production settings.
// The API URL should point to the backend service that handles sentiment analysis and other functionalities.
// Ensure that the Firebase configuration is set up correctly for the project.