import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
    return (
        <div className={styles.layoutContainer}>
            <Sidebar />
            <main className={styles.mainContent}>
                <div className={styles.pageWrapper}>
                    {children || <Outlet />}
                </div>
            </main>
        </div>
    );
};

export default Layout;
