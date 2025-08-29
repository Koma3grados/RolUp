import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./store/AuthContext.tsx";
import "./App.css";
import { ImageCacheProvider } from "./features/fileStorage/context/ImageCacheContext.tsx";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <ImageCacheProvider>
        <App />
      </ImageCacheProvider>
    </AuthProvider>
  </React.StrictMode>
);
