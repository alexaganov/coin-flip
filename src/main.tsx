import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import SoundEffectsProvider from "./SoundEffectsProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SoundEffectsProvider>
      <App />
    </SoundEffectsProvider>
  </React.StrictMode>
);
