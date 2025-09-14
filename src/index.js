import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-primary via-accent to-secondary animate-gradient">
      <App />
    </div>
  </React.StrictMode>
);
