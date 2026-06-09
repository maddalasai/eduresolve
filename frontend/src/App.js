import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import AllComplaints from './pages/AllComplaints';
import MyComplaints from './pages/MyComplaints';
import AdminDashboard from './pages/AdminDashboard';
import SupportStaffDashboard from './pages/SupportStaffDashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import HODDashboard from './pages/HODDashboard';
import WardenDashboard from './pages/WardenDashboard';
import HostelManagerDashboard from './pages/HostelManagerDashboard';
import LibrarianDashboard from './pages/LibrarianDashboard';
import TransportDashboard from './pages/TransportDashboard';

// This function decides which dashboard to show based on the user's role.
// Think of it like a security guard who checks your ID card and sends you
// to the right room.
function RoleBasedDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!token) return <Navigate to="/" />;

  switch (user?.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'SUPPORT_STAFF':
      return <SupportStaffDashboard />;
    case 'COORDINATOR':
      return <CoordinatorDashboard />;
    case 'HOD':
      return <HODDashboard />;
    case 'WARDEN':
      return <WardenDashboard />;
    case 'HOSTEL_MANAGER':
      return <HostelManagerDashboard />;
    case 'LIBRARIAN':
      return <LibrarianDashboard />;
    case 'TRANSPORT_MANAGER':
      return <TransportDashboard />;
    default:
      // STUDENT and any unknown role goes to the general Dashboard
      return <Dashboard />;
  }
}

function App() {
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        {/* Login page — everyone starts here */}
        <Route path="/" element={<Login />} />

        {/* /dashboard now automatically shows the right dashboard for each role */}
        <Route path="/dashboard" element={<RoleBasedDashboard />} />

        {/* These pages are shared across roles */}
        <Route path="/submit" element={token ? <SubmitComplaint /> : <Navigate to="/" />} />
        <Route path="/all-complaints" element={token ? <AllComplaints /> : <Navigate to="/" />} />
        <Route path="/my-complaints" element={token ? <MyComplaints /> : <Navigate to="/" />} />

        {/* Admin has its own direct route too */}
        <Route path="/admin" element={token ? <AdminDashboard /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
