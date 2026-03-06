import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Save } from 'lucide-react';
import styles from './Settings.module.css';

const Settings = () => {
    const { user } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleUpdate = (e) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate update for now
        setTimeout(() => {
            setIsSaving(false);
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        }, 1000);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Settings</h1>
                <p>Manage your account and preferences</p>
            </header>

            <div className={styles.content}>
                <div className={styles.card}>
                    <h3>Profile Information</h3>
                    {message && <div className={styles.success}>{message}</div>}
                    <form onSubmit={handleUpdate}>
                        <div className={styles.formGroup}>
                            <label><User size={16} /> Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label><Mail size={16} /> Email Address</label>
                            <input type="email" value={user?.email} disabled />
                        </div>
                        <div className={styles.formGroup}>
                            <label><Shield size={16} /> Account Type</label>
                            <input type="text" value={user?.role} disabled />
                        </div>
                        <button type="submit" disabled={isSaving} className={styles.saveBtn}>
                            <Save size={18} />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>

                <div className={styles.card}>
                    <h3>Security</h3>
                    <p className={styles.helper}>Update your password to keep your account secure.</p>
                    <button className={styles.outlineBtn}>Change Password</button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
