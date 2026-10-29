import { SignUp } from "@clerk/clerk-react";
import { Link, Navigate } from "react-router-dom";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = PUBLISHABLE_KEY && 
                          !PUBLISHABLE_KEY.startsWith("pk_test_your_") && 
                          PUBLISHABLE_KEY !== "";

export default function Register() {
  if (!isClerkConfigured) {
    return <Navigate to="/" replace />;
  }
  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className="auth-header" style={{ width: "100%" }}>
          <div className="auth-logo">LokSeva AI</div>
          <div className="auth-subtitle">Create citizen account for regional grievance assistance</div>
        </div>

        {/* Clerk Sign Up component */}
        <SignUp
          forceRedirectUrl="/dashboard"
          signInUrl="/"
          appearance={{
            variables: {
              colorPrimary: '#f97316',
              colorBackground: '#130f0b',
              colorText: '#f8fafc',
              colorInputBackground: '#0a0705',
              colorInputText: '#f8fafc',
              colorTextSecondary: '#cbd5e1'
            }
          }}
        />

        <div className="auth-footer" style={{ marginTop: "24px", borderTop: "1px solid var(--border-light)", paddingTop: "12px", width: "100%" }}>
          Already have an account? <Link to="/">Sign In here</Link>
        </div>
      </div>
    </div>
  );
}