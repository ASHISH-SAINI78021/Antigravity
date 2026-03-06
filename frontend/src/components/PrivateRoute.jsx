import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>;

    return user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
