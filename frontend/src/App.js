import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RetirementPlan from './pages/RetirementPlan';
import RetirementComparison from './pages/RetirementComparison';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/retirement-plan" element={<ProtectedRoute><RetirementPlan /></ProtectedRoute>} />
        <Route path="/retirement-comparison" element={<ProtectedRoute><RetirementComparison /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;