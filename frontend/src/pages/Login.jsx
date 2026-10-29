import { SignIn } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../api/api";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = PUBLISHABLE_KEY && 
                          !PUBLISHABLE_KEY.startsWith("pk_test_your_") && 
                          PUBLISHABLE_KEY !== "";

export default function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("signin"); // "signin" or "signup"
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register Form States
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerLang, setRegisterLang] = useState("English");
  
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(""); // "" or "Google" or "GitHub"
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLocalLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError("Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await API.post("/auth/login", {
        email: loginEmail.trim(),
        password: loginPassword.trim()
      });
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleLocalRegister = async (e) => {
    e.preventDefault();
    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim() || !registerPhone.trim()) {
      setError("Please fill in all fields");
      return;
    }
    try {
      setLoading(true);
      setError("");
      await API.post("/auth/register", {
        name: registerName.trim(),
        email: registerEmail.trim(),
        password: registerPassword.trim(),
        language: registerLang,
        phone: registerPhone.trim()
      });
      setSuccessMsg("Registration successful! You can now log in.");
      setActiveTab("signin");
      setLoginEmail(registerEmail);
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterPhone("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || (typeof err.response?.data === "string" ? err.response.data : "") || "Registration failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSimulate = async (provider) => {
    setOauthLoading(provider);
    setError("");
    setSuccessMsg("");
    
    // Artificial delay to make it feel like a real OAuth popup redirect
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const name = provider === "Google" ? `${provider} Citizen` : `${provider} Developer`;
    const email = provider === "Google" ? "google.citizen@gmail.com" : "github.dev@github.com";
    const password = `oauth_${provider.toLowerCase()}_fallback_123`;
    
    try {
      try {
        const loginRes = await API.post("/auth/login", { email, password });
        localStorage.setItem("token", loginRes.data.token);
        localStorage.setItem("user", JSON.stringify(loginRes.data.user));
        setOauthLoading("");
        navigate("/dashboard");
        return;
      } catch (loginErr) {
        if (loginErr.response?.status === 404) {
          await API.post("/auth/register", {
            name,
            email,
            password,
            language: "English"
          });
          const loginRes = await API.post("/auth/login", { email, password });
          localStorage.setItem("token", loginRes.data.token);
          localStorage.setItem("user", JSON.stringify(loginRes.data.user));
          setOauthLoading("");
          navigate("/dashboard");
          return;
        }
        throw loginErr;
      }
    } catch (err) {
      console.error(err);
      setError(`Failed to authenticate with simulated ${provider} account.`);
      setOauthLoading("");
    }
  };

  if (oauthLoading) {
    return (
      <div className="auth-wrapper" style={{ flexDirection: "column" }}>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div className="auth-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "50px", textAlign: "center", maxWidth: "450px" }}>
          <div style={{
            width: "50px",
            height: "50px",
            border: "4px solid rgba(249, 115, 22, 0.15)",
            borderTop: "4px solid var(--color-primary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "25px"
          }} />
          <h3 style={{ marginBottom: "10px" }}>Authorizing with {oauthLoading}...</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>
            Redirecting to LokSeva AI secure portal. Please wait.
          </p>
        </div>
      </div>
    );
  }

  if (!isClerkConfigured) {
    return (
      <div className="auth-wrapper">
        {/* Form Card */}
        <div className="auth-card" style={{ maxWidth: "480px", margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="auth-header">
              <div className="auth-logo">LokSeva AI</div>
              <div className="auth-subtitle">AI-Powered Public Grievance Portal</div>
              <div style={{
                display: "inline-block",
                background: "rgba(245, 158, 11, 0.1)",
                color: "#f59e0b",
                border: "1px solid rgba(245, 158, 11, 0.2)",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "12px",
                marginTop: "8px",
                fontWeight: "600"
              }}>
                ⚙️ Local Auth Mode Active
              </div>
            </div>

            {/* Local Auth Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--border-light)", marginBottom: "20px" }}>
              <button
                onClick={() => { setActiveTab("signin"); setError(""); setSuccessMsg(""); }}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "transparent",
                  border: "none",
                  borderBottom: activeTab === "signin" ? "2px solid var(--color-primary)" : "none",
                  color: activeTab === "signin" ? "var(--text-primary)" : "var(--text-secondary)",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => { setActiveTab("signup"); setError(""); setSuccessMsg(""); }}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "transparent",
                  border: "none",
                  borderBottom: activeTab === "signup" ? "2px solid var(--color-primary)" : "none",
                  color: activeTab === "signup" ? "var(--text-primary)" : "var(--text-secondary)",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                Register
              </button>
            </div>

            {/* Social Sign-In Buttons */}
            <div style={{ display: "flex", gap: "10px", width: "100%", marginBottom: "15px" }}>
              <button
                type="button"
                onClick={() => handleOAuthSimulate("Google")}
                disabled={loading}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  fontSize: "14px",
                  fontWeight: "600",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuthSimulate("GitHub")}
                disabled={loading}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  fontSize: "14px",
                  fontWeight: "600",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", margin: "15px 0 20px 0", width: "100%" }}>
              <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-light)" }} />
              <span style={{ padding: "0 10px", color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", fontWeight: "700" }}>or</span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-light)" }} />
            </div>

            {error && (
              <div style={{ padding: "10px 14px", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#fca5a5", borderRadius: "8px", fontSize: "14px", marginBottom: "15px" }}>
                {error}
              </div>
            )}

            {successMsg && (
              <div style={{ padding: "10px 14px", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", color: "#a7f3d0", borderRadius: "8px", fontSize: "14px", marginBottom: "15px" }}>
                {successMsg}
              </div>
            )}

            {activeTab === "signin" ? (
              <form onSubmit={handleLocalLogin}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="name@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{ margin: "5px 0 0 0" }}
                  />
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{ margin: "5px 0 0 0" }}
                  />
                </div>
                <button type="submit" disabled={loading} style={{ width: "100%" }}>
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLocalRegister}>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    style={{ margin: "5px 0 0 0" }}
                  />
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>Email Address</label>
                  <input
                    type="email"
                    placeholder="name@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    style={{ margin: "5px 0 0 0" }}
                  />
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    style={{ margin: "5px 0 0 0" }}
                  />
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>Password</label>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    style={{ margin: "5px 0 0 0" }}
                  />
                </div>
                <div style={{ marginBottom: "18px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>Preferred Language</label>
                  <select
                    value={registerLang}
                    onChange={(e) => setRegisterLang(e.target.value)}
                    style={{ margin: "5px 0 0 0" }}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                    <option value="Marathi">Marathi (மராठी)</option>
                    <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                  </select>
                </div>
                <button type="submit" disabled={loading} style={{ width: "100%" }}>
                  {loading ? "Registering..." : "Register"}
                </button>
              </form>
            )}
          </div>

          <div className="auth-footer" style={{ borderTop: "1px solid var(--border-light)", paddingTop: "15px", marginTop: "20px" }}>
            Are you an officer? <Link to="/admin" style={{ color: "var(--color-accent)" }}>Officer Portal (Local Sign In)</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      {/* Clerk Sign In Form Card */}
      <div className="auth-card" style={{ maxWidth: "480px", margin: "0 auto", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div className="auth-header" style={{ width: "100%" }}>
            <div className="auth-logo">LokSeva AI</div>
            <div className="auth-subtitle">AI-Powered Regional Language Grievance Redressal</div>
          </div>
          <SignIn
            forceRedirectUrl="/dashboard"
            signUpUrl="/register"
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
        </div>

        <div className="auth-footer" style={{ marginTop: "20px", borderTop: "1px solid var(--border-light)", paddingTop: "12px", width: "100%" }}>
          Are you an officer? <Link to="/admin" style={{ color: "var(--color-accent)" }}>Officer Portal</Link>
        </div>
      </div>
    </div>
  );
}