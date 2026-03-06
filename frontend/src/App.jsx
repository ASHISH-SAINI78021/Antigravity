import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import ImportPage from './pages/ImportPage';
import PrepHub from './pages/PrepHub';
import PrepRoom from './pages/PrepRoom';
import JoinRoom from './pages/JoinRoom';
import Resumes from './pages/Resumes';
import Settings from './pages/Settings';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Private Routes */}
                    <Route element={<PrivateRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/jobs" element={<Jobs />} />
                            <Route path="/import/:token" element={<ImportPage />} />
                            <Route path="/prep" element={<PrepHub />} />
                            <Route path="/prep/join/:roomCode" element={<JoinRoom />} />
                            <Route path="/prep/:roomId" element={<PrepRoom />} />
                            <Route path="/resumes" element={<Resumes />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        </Route>
                    </Route>

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App
