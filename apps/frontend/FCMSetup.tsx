'use client';

import { useEffect } from "react";
import { requestFcmToken } from "./firebase/requestFcmToken";


export default function FCMSetup() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then(() => {
          requestFcmToken();
        })
        .catch((err) => console.error("Service worker registration failed:", err));
    }
  }, []);

  return null; // or some status UI
}
