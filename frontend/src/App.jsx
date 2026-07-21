import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import LandingPage from "./pages/LandingPage";
import AuthPages from "./pages/AuthPages";
import Dashboard from "./pages/Dashboard";
import Workspace from "./pages/Workspace";
import OnboardingModal from "./components/OnboardingModal";
import MandatoryPasswordResetModal from "./components/MandatoryPasswordResetModal";
import { supabase } from "./lib/supabaseClient";
import { api } from "./lib/api";

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.hash || window.location.pathname);
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);

  const syncUserProfile = async () => {
    try {
      await api.post("/api/users/sync");
      const profile = await api.get("/api/users/me");
      setUserProfile(profile);

      // BUG 1 FIX: Belt-and-suspenders check — NEVER show password reset modal to Owner role
      if (profile?.must_reset_password && profile?.role !== "Owner") {
        setShowPasswordResetModal(true);
        setShowOnboarding(false);
      } else if (!profile?.agency_id) {
        setShowOnboarding(true);
        setShowPasswordResetModal(false);
      } else {
        setShowOnboarding(false);
        setShowPasswordResetModal(false);
      }
    } catch (err) {
      console.error("Failed to sync user profile with backend:", err);
    }
  };

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.hash || window.location.pathname);
    };

    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);

    // BUG 2 FIX: Resolve initial Supabase session & sync profile BEFORE unblocking route rendering
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      setSession(existingSession);
      if (existingSession) {
        await syncUserProfile();
        const hash = window.location.hash;
        const path = window.location.pathname;
        if (!hash || hash === "#" || hash.includes("auth") || path.includes("auth")) {
          window.location.hash = "#dashboard";
        }
      }
      setLoadingSession(false);
    });

    // Real-time auth state listener to keep app auth state in sync
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      if (newSession) {
        await syncUserProfile();
        const hash = window.location.hash;
        const path = window.location.pathname;
        if (!hash || hash === "#" || hash.includes("auth") || path.includes("auth")) {
          window.location.hash = "#dashboard";
        }
        setLoadingSession(false);
      } else {
        setUserProfile(null);
        setShowOnboarding(false);
        setShowPasswordResetModal(false);
        setLoadingSession(false);
        if (event === "SIGNED_OUT") {
          window.location.hash = "#auth-signin";
        }
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

  // Route Protection: If no active session exists, redirect to sign-in page
  if (isProtectedPath && !session) {
    window.location.hash = "#auth-signin";
    return <AuthPages initialTab="signin" />;
  }

  return (
    <>
      {session && showPasswordResetModal && userProfile?.role !== "Owner" && (
        <MandatoryPasswordResetModal
          userEmail={userProfile?.email || session?.user?.email}
          onPasswordResetComplete={() => {
            setShowPasswordResetModal(false);
            setUserProfile((prev) => ({ ...prev, must_reset_password: false }));
            if (!userProfile?.agency_id) {
              setShowOnboarding(true);
            } else {
              window.location.hash = "#dashboard";
            }
          }}
        />
      )}

      {session && !showPasswordResetModal && showOnboarding && (
        <OnboardingModal
          onAgencyCreated={(newAgency) => {
            setUserProfile((prev) => ({ ...prev, agency_id: newAgency._id }));
            setShowOnboarding(false);
            window.location.hash = "#dashboard";
          }}
        />
      )}

      {currentPath.startsWith("#workspace") || currentPath.startsWith("/workspace") ? (
        <Workspace onBackToDashboard={() => (window.location.hash = "#dashboard")} />
      ) : currentPath.startsWith("#dashboard") || currentPath.startsWith("/dashboard") ? (
        <Dashboard session={session} userProfile={userProfile} />
      ) : currentPath.startsWith("#auth") || currentPath.startsWith("/auth") ? (
        <AuthPages initialTab={currentPath.includes("signin") || currentPath.includes("login") ? "signin" : "signup"} />
      ) : (
        <LandingPage />
      )}
    </>
  );
}

export default App;
