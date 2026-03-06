import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Set axios defaults
    axios.defaults.baseURL = '/api';
    axios.defaults.withCredentials = true;

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const res = await axios.get('auth/me');
            setUser(res.data.data);
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post('auth/login', { email, password });
            await checkUser();
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post('auth/register', userData);
            await checkUser();
            return res.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await axios.get('auth/logout');
            setUser(null);
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, logout, checkUser }}>
            {children}
        </AuthContext.Provider>
    );
};
