import { useNavigate, useLocation } from "react-router-dom";
import { useUser, useClerk, UserButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import API from "../api/api";

const navbarTranslations = {
  English: {
    dashboard: "Dashboard",
    registerGrievance: "✍️ File Grievance",
    ai: "✨ AI Assistant",
    proxy: "🏬 Helper Proxy",
    ivr: "📞 IVR Bot",
    myGrievances: "My Grievances",
    trackId: "Track ID",
    departments: "Departments",
    processFlow: "How it Works",
    communityMap: "🗺️ Community Map",
    whatsappChatbot: "💬 WhatsApp Bot"
  },
  Tamil: {
    dashboard: "டாஷ்போர்டு",
    registerGrievance: "✍️ புகார் செய்க",
    ai: "AI உதவியாளர்",
    proxy: "உதவியாளர் பதிலி",
    ivr: "IVR போட்",
    myGrievances: "எனது புகார்கள்",
    trackId: "ஐடியை தேடு",
    departments: "துறைகள்",
    processFlow: "செயல்முறை",
    communityMap: "🗺️ வரைபடம்",
    whatsappChatbot: "💬 வாட்ஸ்அப் போட்"
  },
  Hindi: {
    dashboard: "डैशबोर्ड",
    registerGrievance: "✍️ शिकायत दर्ज करें",
    ai: "AI सहायक",
    proxy: "सहायक प्रॉक्सी",
    ivr: "आईवीआर बॉट",
    myGrievances: "मेरी शिकायतें",
    trackId: "ट्रैक आईडी",
    departments: "विभाग निर्देशिका",
    processFlow: "प्रक्रिया प्रवाह",
    communityMap: "🗺️ सामुदायिक मानचित्र",
    whatsappChatbot: "💬 व्हाट्सएप बॉट"
  }
};

function Navbar() {
  const currentLang = localStorage.getItem("preferredLang") || "English";
  const nt = navbarTranslations[currentLang] || navbarTranslations["English"];
  const navigate = useNavigate();
  const location = useLocation();
  const { user: clerkUser, isSignedIn } = useUser();
  const { signOut } = useClerk();
  
  // Local storage user fallback (for Admin/Officer)
  const userStr = localStorage.getItem("user");
  const localUser = (userStr && userStr !== "undefined") ? JSON.parse(userStr) : null;

  const [dbUser, setDbUser] = useState(null);

  // If logged in via Clerk, fetch MongoDB profile to get preferred language & sync name
  useEffect(() => {
    if (isSignedIn) {
      const fetchProfile = async () => {
        try {
          const res = await API.get("/auth/me");
          let userData = res.data;
          const realName = clerkUser?.fullName || clerkUser?.firstName || clerkUser?.primaryEmailAddress?.emailAddress?.split("@")[0];
          if (realName && (userData.name.startsWith("clerk_") || userData.name === "Citizen" || userData.name !== realName)) {
            try {
              const updateRes = await API.put("/auth/profile", { name: realName });
              userData = updateRes.data.user;
            } catch (updateErr) {
              userData.name = realName;
            }
          }
          setDbUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (err) {
          console.error("Failed to sync profile in Navbar:", err);
        }
      };
      fetchProfile();
    }
  }, [isSignedIn, clerkUser]);

  const handleLogout = async () => {
    if (isSignedIn) {
      await signOut();
      localStorage.removeItem("user");
      navigate("/");
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={styles.navBar}>
      <div style={styles.brand} onClick={() => navigate(isSignedIn ? "/dashboard" : "/admin")}>
        <span style={styles.brandLogo}>LokSeva AI</span>
        <span style={styles.brandBadge}>Govt Portal</span>
      </div>

      {/* Hide links if not logged in on either system */}
      {(isSignedIn || localUser) && (
        <div style={styles.links}>
          {localUser && (localUser.role === "admin" || localUser.role === "superadmin") ? (
            <>
              <button
                onClick={() => navigate("/admin?tab=dashboard")}
                style={
                  location.pathname === "/admin" &&
                  (location.search === "" || location.search.includes("tab=dashboard"))
                    ? styles.activeBtn
                    : styles.navBtn
                }
              >
                📊 Grievances
              </button>
              <button
                onClick={() => navigate("/admin?tab=users")}
                style={
                  location.pathname === "/admin" && location.search.includes("tab=users")
                    ? styles.activeBtn
                    : styles.navBtn
                }
              >
                👥 Officer Directory
              </button>
              <button
                onClick={() => navigate("/admin?tab=departments")}
                style={
                  location.pathname === "/admin" && location.search.includes("tab=departments")
                    ? styles.activeBtn
                    : styles.navBtn
                }
              >
                🏢 Departments
              </button>
              {localUser.role === "superadmin" && (
                <button
                  onClick={() => navigate("/admin?tab=system")}
                  style={
                    location.pathname === "/admin" && location.search.includes("tab=system")
                      ? styles.activeBtn
                      : styles.navBtn
                  }
                >
                  ⚙️ System Status
                </button>
              )}
              <button
                onClick={() => navigate("/admin?tab=clusters")}
                style={
                  location.pathname === "/admin" && location.search.includes("tab=clusters")
                    ? styles.activeBtn
                    : styles.navBtn
                }
              >
                👥 Grievance Clusters
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/dashboard")}
                style={isActive("/dashboard") ? styles.activeBtn : styles.navBtn}
              >
                {nt.dashboard}
              </button>
              <button
                onClick={() => navigate("/ai")}
                style={isActive("/ai") ? styles.activeBtn : styles.navBtn}
              >
                {nt.ai}
              </button>
              <button
                onClick={() => navigate("/proxy")}
                style={isActive("/proxy") ? styles.activeBtn : styles.navBtn}
              >
                {nt.proxy}
              </button>
              <button
                onClick={() => navigate("/ivr-call")}
                style={isActive("/ivr-call") ? styles.activeBtn : styles.navBtn}
              >
                {nt.ivr}
              </button>
              <button
                onClick={() => navigate("/mycomplaints")}
                style={isActive("/mycomplaints") ? styles.activeBtn : styles.navBtn}
              >
                {nt.myGrievances}
              </button>
              <button
                onClick={() => navigate("/track")}
                style={isActive("/track") ? styles.activeBtn : styles.navBtn}
              >
                {nt.trackId}
              </button>
              <button
                onClick={() => navigate("/nodal-directory")}
                style={isActive("/nodal-directory") ? styles.activeBtn : styles.navBtn}
              >
                👤 {nt.departments}
              </button>
              <button
                onClick={() => navigate("/process-flow")}
                style={isActive("/process-flow") ? styles.activeBtn : styles.navBtn}
              >
                🛣️ {nt.processFlow}
              </button>
              <button
                onClick={() => navigate("/community-map")}
                style={isActive("/community-map") ? styles.activeBtn : styles.navBtn}
              >
                {nt.communityMap}
              </button>
            </>
          )}
        </div>
      )}
      {/* Global Language Selector Dropdown */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginRight: "15px" }}>
        <span style={{ fontSize: "14px", color: "#94a3b8" }}>🌐</span>
        <select
          value={localStorage.getItem("preferredLang") || localUser?.language || "English"}
          onChange={async (e) => {
            const newLang = e.target.value;
            localStorage.setItem("preferredLang", newLang);
            
            // Sync with local storage user profile
            const userStr = localStorage.getItem("user");
            if (userStr && userStr !== "undefined") {
              try {
                const u = JSON.parse(userStr);
                u.language = newLang;
                localStorage.setItem("user", JSON.stringify(u));
              } catch (err) {
                console.error(err);
              }
            }
            
            // Sync with backend database profile
            try {
              await API.put("/auth/profile", { language: newLang });
            } catch (err) {
              console.error("Backend language sync failed:", err);
            }
            
            // Reload page to propagate changes globally
            window.location.reload();
          }}
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            color: "#f8fafc",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
            outline: "none"
          }}
        >
          <option value="English">English</option>
          <option value="Tamil">தமிழ் (Tamil)</option>
          <option value="Hindi">हिन्दी (Hindi)</option>
        </select>
      </div>

      <div style={styles.userInfo}>
        {/* Clerk User Button */}
        {isSignedIn && clerkUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={styles.userCard}>
              <span style={styles.userName}>{clerkUser.fullName || clerkUser.primaryEmailAddress?.emailAddress}</span>
              <span style={styles.userLang}>Lang: {dbUser?.language || "English"}</span>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        ) : (
          /* Standard JWT User / Logout */
          localUser && (
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div style={styles.userCard}>
                <span style={styles.userName}>{localUser.name}</span>
                <span style={styles.userLang}>Role: {localUser.role}</span>
              </div>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

const styles = {
  navBar: {
    background: "rgba(19, 27, 46, 0.9)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "16px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backdropFilter: "blur(12px)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
  },
  brandLogo: {
    fontSize: "22px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  brandBadge: {
    fontSize: "10px",
    fontWeight: "700",
    textTransform: "uppercase",
    background: "rgba(249, 115, 22, 0.15)",
    color: "#f97316",
    padding: "3px 8px",
    borderRadius: "9999px",
    border: "1px solid rgba(249, 115, 22, 0.2)",
  },
  links: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  navBtn: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: "600",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    boxShadow: "none",
    transition: "all 0.2s",
  },
  navBtnPrimary: {
    background: "rgba(249, 115, 22, 0.15)",
    border: "1px solid rgba(249, 115, 22, 0.3)",
    color: "#fdba74",
    fontSize: "14px",
    fontWeight: "600",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    boxShadow: "none",
    transition: "all 0.2s",
  },
  activeBtn: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "none",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    padding: "8px 16px",
    borderRadius: "6px",
    boxShadow: "none",
    cursor: "pointer",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  userCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  userName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#f8fafc",
  },
  userLang: {
    fontSize: "11px",
    color: "#64748b",
  },
  logoutBtn: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    color: "#fca5a5",
    fontSize: "13px",
    fontWeight: "600",
    padding: "6px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    boxShadow: "none",
    transition: "all 0.2s",
  }
};

export default Navbar;