import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";


import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";

import CreateComplaint from "../pages/CreateComplaint";
import MyComplaints from "../pages/MyComplaints";
import TrackComplaint from "../pages/TrackComplaint";

import AdminDashboard from "../pages/AdminDashboard";

import ProtectedRoute from "../components/ProtectedRoute";

import AIChat from "../pages/AIChat";
import VolunteerProxy from "../pages/VolunteerProxy";
import IVRPhoneSimulator from "../pages/IVRPhoneSimulator";
import NodalDirectory from "../pages/NodalDirectory";
import ProcessFlow from "../pages/ProcessFlow";
import CommunityMap from "../pages/CommunityMap";


function AppRoutes(){


return (

<BrowserRouter>


<Routes>


<Route
path="/"
element={<Login/>}
/>


<Route
path="/register"
element={<Register/>}
/>



<Route
path="/dashboard"
element={
<ProtectedRoute>
<Dashboard/>
</ProtectedRoute>
}
/>



<Route
path="/create"
element={
<ProtectedRoute>
<CreateComplaint/>
</ProtectedRoute>
}
/>

<Route
path="/dashboard/create"
element={<Navigate to="/create" replace />}
/>



<Route
path="/mycomplaints"
element={
<ProtectedRoute>
<MyComplaints/>
</ProtectedRoute>
}
/>



<Route
path="/track"
element={
<TrackComplaint/>
}
/>



<Route
path="/admin"
element={
<AdminDashboard/>
}
/>



<Route
path="/ai"
element={
<ProtectedRoute>
<AIChat/>
</ProtectedRoute>
}
/>

<Route
path="/proxy"
element={
<ProtectedRoute>
<VolunteerProxy/>
</ProtectedRoute>
}
/>

<Route
path="/ivr-call"
element={
<ProtectedRoute>
<IVRPhoneSimulator/>
</ProtectedRoute>
}
/>

<Route
path="/nodal-directory"
element={
<ProtectedRoute>
<NodalDirectory/>
</ProtectedRoute>
}
/>

<Route
path="/process-flow"
element={
<ProtectedRoute>
<ProcessFlow/>
</ProtectedRoute>
}
/>



<Route
path="/community-map"
element={
<ProtectedRoute>
<CommunityMap/>
</ProtectedRoute>
}
/>



</Routes>


</BrowserRouter>


);


}


export default AppRoutes;