import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

/*
  GitHub Pages SPA redirect recovery
*/
const redirectPath = sessionStorage.getItem("redirect");

if (redirectPath) {
  sessionStorage.removeItem("redirect");

  const currentPath = window.location.pathname;

  if (
    currentPath === "/sahityananda/" ||
    currentPath === "/sahityananda"
  ) {
    window.history.replaceState(
      null,
      "",
      "/sahityananda" + redirectPath
    );
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
