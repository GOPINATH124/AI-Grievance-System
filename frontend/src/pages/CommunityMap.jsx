import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../api/api";

export default function CommunityMap() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");

  useEffect(() => {
    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    if (!window.L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => {
        loadDataAndMap();
      };
      document.body.appendChild(script);
    } else {
      loadDataAndMap();
    }
  }, []);

  const loadDataAndMap = async () => {
    try {
      setLoading(true);
      const res = await API.get("/complaint/public-list");
      setComplaints(res.data);
      initLeafletMap(res.data);
    } catch (err) {
      console.error("Failed to load public complaints:", err);
      // Fallback seeds if backend fails
      const fallbacks = [
        { complaintId: "GRV101", title: "Water Line Leakage", description: "Water leaking at main road corner.", priority: "High", status: "Pending", department: "Water Supply Department", latitude: 12.9720, longitude: 77.5950, subscriberCount: 4 },
        { complaintId: "GRV102", title: "Street Light Broken", description: "All streetlights are off since 3 days.", priority: "Medium", status: "Processing", department: "Electricity Department", latitude: 12.9750, longitude: 77.5910, subscriberCount: 12 },
        { complaintId: "GRV103", title: "Open Garbage Dump", description: "Garbage piled up near park entrance.", priority: "Emergency", status: "Assigned", department: "Sanitation Department", latitude: 12.9690, longitude: 77.5980, subscriberCount: 23 }
      ];
      setComplaints(fallbacks);
      initLeafletMap(fallbacks);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === "Emergency" || priority === "High") return "#ef4444";
    if (priority === "Medium") return "#f59e0b";
    return "#10b981";
  };

  const initLeafletMap = (dataList) => {
    if (!window.L) return;
    const mapDiv = document.getElementById("community-leaflet-map");
    if (!mapDiv) return;
    
    // Clear existing map instance
    if (window.communityMapInstance) {
      window.communityMapInstance.remove();
      window.communityMapInstance = null;
    }

    const map = window.L.map("community-leaflet-map").setView([12.9716, 77.5946], 14);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    const layerGroup = window.L.layerGroup().addTo(map);
    
    window.communityMapInstance = map;
    window.communityMarkerLayerGroup = layerGroup;

    renderMarkers(dataList, layerGroup);
  };

  const renderMarkers = (list, layerGroup) => {
    if (!window.L || !layerGroup) return;
    layerGroup.clearLayers();

    list.forEach((c) => {
      const color = getPriorityColor(c.priority);
      
      const customIcon = window.L.divIcon({
        className: "custom-marker",
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const popupContent = document.createElement("div");
      popupContent.style.padding = "6px";
      popupContent.style.maxWidth = "280px";
      popupContent.style.fontFamily = "Inter, sans-serif";
      
      popupContent.innerHTML = `
        <h4 style="margin: 0 0 6px 0; color: #1e293b; font-size: 14px;">${c.title}</h4>
        <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: rgba(37, 99, 235, 0.15); color: #2563eb; font-weight: 700;">
          ${c.department}
        </span>
        <p style="margin: 8px 0; font-size: 12px; color: #475569; line-height: 1.4;">${c.description.substring(0, 100)}${c.description.length > 100 ? "..." : ""}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 8px; margin-top: 8px;">
          <span style="font-size: 11px; color: #10b981; font-weight: 700;">📢 ${c.subscriberCount || 0} Followers</span>
          <button id="sub-btn-${c.complaintId}" style="padding: 4px 10px; font-size: 11px; font-weight: 700; border-radius: 4px; background: #2563eb; color: #fff; border: none; cursor: pointer;">
            🔔 Follow Updates
          </button>
        </div>
      `;

      window.L.marker([c.latitude || 12.9716, c.longitude || 77.5946], { icon: customIcon })
        .addTo(layerGroup)
        .bindPopup(popupContent)
        .on("popupopen", () => {
          const btn = document.getElementById(`sub-btn-${c.complaintId}`);
          if (btn) {
            btn.onclick = async () => {
              try {
                const res = await API.post(`/complaint/${c.complaintId}/subscribe`);
                alert(res.data.isSubscribed 
                  ? "🔔 You are now following this complaint! You will receive high-priority notifications for status changes." 
                  : "🔕 You have unfollowed this complaint."
                );
                loadDataAndMap();
              } catch (err) {
                console.error("Subscription failed:", err);
                alert("Failed to subscribe. Please verify you are logged in.");
              }
            };
          }
        });
    });
  };

  useEffect(() => {
    const map = window.communityMapInstance;
    const layer = window.communityMarkerLayerGroup;
    if (!map || !layer) return;

    const filtered = complaints.filter((c) => {
      const matchDept = filterDept === "All" || c.department === filterDept;
      const matchPriority = filterPriority === "All" || c.priority === filterPriority;
      return matchDept && matchPriority;
    });

    renderMarkers(filtered, layer);
  }, [filterDept, filterPriority, complaints]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-main)" }}>
      <Navbar />
      
      <div style={styles.overlayFilters}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <label style={styles.filterLabel}>Department Filter</label>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="All">All Departments</option>
              <option value="Water Supply Department">Water Supply</option>
              <option value="Electricity Department">Electricity</option>
              <option value="Road and Transport Department">Roads & Transport</option>
              <option value="Sanitation Department">Sanitation</option>
              <option value="Health Department">Health Desk</option>
              <option value="Revenue Department">Revenue & Tax</option>
            </select>
          </div>

          <div>
            <label style={styles.filterLabel}>Priority Filter</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="All">All Priorities</option>
              <option value="Emergency">🚨 Emergency</option>
              <option value="High">🔴 High</option>
              <option value="Medium">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "700" }}>
              Active Grievances: <strong style={{ color: "var(--color-primary)" }}>{complaints.length}</strong>
            </span>
          </div>
        </div>
      </div>

      <div id="community-leaflet-map" style={{ flex: 1, zIndex: 1, minHeight: "0" }}></div>
    </div>
  );
}

const styles = {
  overlayFilters: {
    padding: "16px 24px",
    backgroundColor: "var(--card-bg)",
    borderBottom: "1px solid var(--border-light)",
    zIndex: 10,
    boxShadow: "var(--shadow-md)"
  },
  filterLabel: {
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "uppercase",
    color: "var(--text-secondary)",
    display: "block",
    marginBottom: "4px"
  },
  filterSelect: {
    margin: 0,
    padding: "8px 12px",
    fontSize: "13px",
    minWidth: "200px",
    borderRadius: "6px",
    backgroundColor: "var(--bg-main)",
    border: "1px solid var(--border-light)",
    color: "var(--text-primary)"
  }
};
