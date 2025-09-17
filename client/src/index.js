import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import * as React from "react";
window.React = React;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
