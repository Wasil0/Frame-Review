import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import LandingPage from "./pages/LandingPage";
import AuthPages from "./pages/AuthPages";
import Dashboard from "./pages/Dashboard";
import Workspace from "./pages/Workspace";
import { supabase } from "./lib/supabaseClient";

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.hash || window.location.pathname);
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.hash || window.location.pathname);
    };

    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });

    // Listen to real-time auth state changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setLoadingSession(false);

      if (event === "SIGNED_OUT") {
        window.location.hash = "#auth-signin";
      } else if (event === "SIGNED_IN" && (window.location.hash.includes("auth") || window.location.pathname.includes("auth"))) {
        window.location.hash = "#dashboard";
      }
    });

    return () => {
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("popstate", handleLocationChange);
      subscription?.unsubscribe();
    };
  }, []);

  if (loadingSession) {
    return (
      <div className="h-screen w-screen bg-[#090A0F] flex items-center justify-center text-[#22C55E]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const isProtectedPath =
    currentPath.startsWith("#dashboard") ||
    currentPath.startsWith("/dashboard") ||
    currentPath.startsWith("#workspace") ||
    currentPath.startsWith("/workspace");

  // Route Protection: If no active session exists, redirect to sign-in page instead of rendering protected routes
  if (isProtectedPath && !session) {
    window.location.hash = "#auth-signin";
    return <AuthPages initialTab="signin" />;
  }

  if (currentPath.startsWith("#workspace") || currentPath.startsWith("/workspace")) {
    return <Workspace onBackToDashboard={() => (window.location.hash = "#dashboard")} />;
  }

  if (currentPath.startsWith("#dashboard") || currentPath.startsWith("/dashboard")) {
    return <Dashboard session={session} />;
  }

  if (currentPath.startsWith("#auth") || currentPath.startsWith("/auth")) {
    const initialTab = currentPath.includes("signin") || currentPath.includes("login") ? "signin" : "signup";
    return <AuthPages initialTab={initialTab} />;
  }

  return <LandingPage />;
}

export default App;
