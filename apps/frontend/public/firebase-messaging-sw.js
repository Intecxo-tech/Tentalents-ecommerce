importScripts('https://www.gstatic.com/firebasejs/9.24.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.24.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCooYBOJXExeAcdQXJE1_itGquHcVLTvQ0",
  authDomain: "tentalents-ecommerce-58052.firebaseapp.com",
  projectId: "tentalents-ecommerce-58052",
  storageBucket: "tentalents-ecommerce-58052.firebasestorage.appspot.com",
  messagingSenderId: "517240037944",
  appId: "1:517240037944:web:e0941b6a1553ac289efccd",
  measurementId: "G-X09JLBNXDX"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
