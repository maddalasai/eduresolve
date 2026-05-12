import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import AllComplaints from './pages/AllComplaints';
import MyComplaints from './pages/MyComplaints';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const token = localStorage.getItem('token');
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/submit" element={token ? <SubmitComplaint /> : <Navigate to="/" />} />
        <Route path="/all-complaints" element={token ? <AllComplaints /> : <Navigate to="/" />} />
        <Route path="/my-complaints" element={token ? <MyComplaints /> : <Navigate to="/" />} />
        <Route path="/admin" element={token ? <AdminDashboard /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;