import React, { useState, useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import AuthPages from "./pages/AuthPages";

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.hash || window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.hash || window.location.pathname);
    };

    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);

    return () => {
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  if (currentPath.startsWith("#auth") || currentPath.startsWith("/auth")) {
    const initialTab = currentPath.includes("signin") || currentPath.includes("login") ? "signin" : "signup";
    return <AuthPages initialTab={initialTab} />;
  }

  return <LandingPage />;
}

export default App;
