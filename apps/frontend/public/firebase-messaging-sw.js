importScripts("https://www.gstatic.com/firebasejs/9.24.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.24.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
});

firebase.messaging();
