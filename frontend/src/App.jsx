import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Repositories from './pages/Repositories';
import RepositoryDetail from './pages/RepositoryDetail';
import Admin from './pages/Admin';
import ApiDocs from './pages/ApiDocs';
import ChangePassword from './pages/ChangePassword';
import Endpoints from './pages/Endpoints';
import EndpointEditor from './pages/EndpointEditor';
import './index.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>加载中...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>加载中...</div>;
  return user?.isAdmin ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/repositories" element={<Repositories />} />
          <Route path="/api-docs" element={<ApiDocs />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
          <Route path="/endpoints" element={<PrivateRoute><Endpoints /></PrivateRoute>} />
          <Route path="/endpoints/new" element={<PrivateRoute><EndpointEditor /></PrivateRoute>} />
          <Route path="/endpoints/edit/:id" element={<PrivateRoute><EndpointEditor /></PrivateRoute>} />
          <Route path="/repository/:id" element={<RepositoryDetail />} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
