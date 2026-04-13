
import React from "react";
import ReactDOM, { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import "./assets/css/app.css";



const container = document.getElementById("root");

const root = createRoot(container);

root.render(
  <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
    <App />
  </BrowserRouter>
);

