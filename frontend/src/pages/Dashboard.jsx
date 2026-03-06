import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';
import {
    Briefcase,
    Calendar,
    CheckCircle,
    XCircle,
    TrendingUp,
    Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    const { user, checkUser } = useAuth();
    const [stats, setStats] = useState({
        total: 0,
        applied: 0,
        interviews: 0,
        offers: 0,
        rejected: 0,
        conversionRate: 0
    });
    const [chartData, setChartData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initDashboard = async () => {
            await Promise.all([fetchData(), checkUser()]);
            setLoading(false);
        };
        initDashboard();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('jobs');
            const jobs = res.data.data;

            // Calculate Stats
            const total = jobs.length;
            const applied = jobs.filter(j => j.status === 'Applied').length;
            const interviews = jobs.filter(j => j.status === 'Interview').length;
            const offers = jobs.filter(j => j.status === 'Offer').length;
            const rejected = jobs.filter(j => j.status === 'Rejected').length;
            const conversionRate = total > 0 ? ((interviews / total) * 100).toFixed(1) : 0;

            setStats({ total, applied, interviews, offers, rejected, conversionRate });

            // Status Breakdown for Pie Chart
            const statusCounts = jobs.reduce((acc, job) => {
                acc[job.status] = (acc[job.status] || 0) + 1;
                return acc;
            }, {});

            setStatusData(Object.keys(statusCounts).map(key => ({
                name: key,
                value: statusCounts[key]
            })));

            // Timeline for Line Chart (Group by month/day)
            // Simplified: last 7 days or months
            const timeline = jobs.reduce((acc, job) => {
                const date = new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {});

            setChartData(Object.keys(timeline).map(key => ({
                date: key,
                applications: timeline[key]
            })).slice(-7));

        } catch (err) {
            console.error('Error fetching dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#6366f1', '#10b981', '#fbbf24', '#ef4444', '#94a3b8'];

    const StatCard = ({ icon: Icon, label, value, colorClass }) => (
        <div className={styles.statCard}>
            <div className={`${styles.iconWrapper} ${colorClass}`}>
                <Icon size={24} />
            </div>
            <div className={styles.statInfo}>
                <span className={styles.statLabel}>{label}</span>
                <h3 className={styles.statValue}>{value}</h3>
            </div>
        </div>
    );

    if (loading) return <div className={styles.loading}>Analyzing your progress...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Welcome back! 🚀</h1>
                <p>Here's how your job search is progressing.</p>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ staggerChildren: 0.1 }}
                className={styles.statsGrid}
            >
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <StatCard icon={Briefcase} label="Total Apps" value={stats.total} colorClass={styles.bgPrimary} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <StatCard icon={Calendar} label="Interviews" value={stats.interviews} colorClass={styles.bgWarning} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <StatCard icon={CheckCircle} label="Offers" value={stats.offers} colorClass={styles.bgSuccess} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <StatCard icon={TrendingUp} label="Conv. Rate" value={`${stats.conversionRate}%`} colorClass={styles.bgAccent} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <div className={`${styles.statCard} ${styles.streakCard}`}>
                        <div className={`${styles.iconWrapper} ${styles.bgStreak}`}>
                            <Flame size={24} className={styles.flameIcon} />
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statLabel}>Day Streak</span>
                            <h3 className={styles.statValue}>{user?.currentStreak || 0}</h3>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            <div className={styles.chartsGrid}>
                <div className={styles.chartCard}>
                    <h3>Application Status</h3>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className={styles.chartCard}
                >
                    <h3>Activity Timeline</h3>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="date" stroke="#64748b" axisLine={false} tickLine={false} dy={10} />
                                <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="applications"
                                    stroke="#818cf8"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorApps)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
