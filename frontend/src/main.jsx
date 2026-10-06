import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { registerServiceWorker } from "./utils/pushNotification.js";

// Ensure Service Worker is registered immediately for background push notifications
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  registerServiceWorker().catch(() => {});
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);