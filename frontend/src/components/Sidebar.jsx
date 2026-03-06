import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Briefcase,
    FileText,
    Settings,
    LogOut,
    Rocket,
    Users
} from 'lucide-react';
import styles from './Layout.module.css';

const Sidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/jobs', icon: <Briefcase size={20} />, label: 'Applications' },
        { path: '/prep', icon: <Users size={20} />, label: 'Prep Hub' },
        { path: '/resumes', icon: <FileText size={20} />, label: 'My Resumes' },
        { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <Rocket className={styles.logoIcon} />
                <span>Antigravity</span>
            </div>

            <nav className={styles.nav}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                        }
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <button onClick={handleLogout} className={styles.logoutBtn}>
                <LogOut size={20} />
                <span>Sign Out</span>
            </button>
        </aside>
    );
};

export default Sidebar;
