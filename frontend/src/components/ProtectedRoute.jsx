import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = PUBLISHABLE_KEY && 
                          !PUBLISHABLE_KEY.startsWith("pk_test_your_") && 
                          PUBLISHABLE_KEY !== "";

function ClerkProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", color: "var(--text-secondary)" }}>
        Loading session...
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function LocalProtectedRoute({ children }) {
  const localToken = localStorage.getItem("token");

  if (!localToken) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function ProtectedRoute({ children }) {
  if (isClerkConfigured) {
    return <ClerkProtectedRoute>{children}</ClerkProtectedRoute>;
  } else {
    return <LocalProtectedRoute>{children}</LocalProtectedRoute>;
  }
}

export default ProtectedRoute;