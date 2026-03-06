import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <div className={styles.logo}>
                    <span className={styles.logoIcon}>🚀</span>
                    <h1>Antigravity</h1>
                </div>
                <h2>Welcome Back</h2>
                <p className={styles.subtitle}>Log in to your job tracker account</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="name@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.submitBtn}>
                        Sign In
                    </button>
                </form>

                <div className={styles.footer}>
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
