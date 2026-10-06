import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { registerPwa } from "./utils/pwaManager.js";

// Register PWA service worker and live auto-updates
registerPwa();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);