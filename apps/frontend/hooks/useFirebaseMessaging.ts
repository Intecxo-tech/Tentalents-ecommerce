// apps/frontend/hooks/useFirebaseMessaging.ts
import { useEffect, useState } from "react";
import { getMessaging, onMessage, Messaging } from "firebase/messaging";
import { app } from "../firebase/firebase.config"; // adjust path if needed

export const useFirebaseMessaging = () => {
  const [messaging, setMessaging] = useState<Messaging | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Dynamically import FCM and initialize it in the browser
      import("firebase/messaging").then(() => {
        const messagingInstance = getMessaging(app);
        setMessaging(messagingInstance);

        // Example: Listen to foreground messages
        onMessage(messagingInstance, (payload) => {
          console.log("Message received: ", payload);
        });
      });
    }
  }, []);

  return messaging;
};
