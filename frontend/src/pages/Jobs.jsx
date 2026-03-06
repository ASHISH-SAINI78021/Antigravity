import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Filter, Share2 } from 'lucide-react';
import AddJobModal from '../components/AddJobModal';
import JobDetailsModal from '../components/JobDetailsModal';
import ShareModal from '../components/ShareModal';
import styles from './Jobs.module.css';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await axios.get('jobs');
            setJobs(res.data.data);
        } catch (err) {
            console.error('Error fetching jobs', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Applied': return styles.statusApplied;
            case 'Interview': return styles.statusInterview;
            case 'Rejected': return styles.statusRejected;
            case 'Offer': return styles.statusOffer;
            default: return styles.statusSaved;
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>My Applications 💼</h1>
                    <p>Track and manage your {jobs.length} job applications.</p>
                </div>
                <div className={styles.buttonGroup}>
                    <button className={styles.shareBtn} onClick={() => setIsShareModalOpen(true)}>
                        <Share2 size={20} />
                        <span>Share Jobs</span>
                    </button>
                    <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} />
                        <span>Add Job</span>
                    </button>
                </div>
            </header>

            <div className={styles.controls}>
                <div className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} size={18} />
                    <input
                        type="text"
                        placeholder="Search by company or title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.filterWrapper}>
                    <Filter className={styles.filterIcon} size={18} />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="All">All Status</option>
                        <option value="Saved">Saved</option>
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Offer">Offer</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading jobs...</div>
            ) : filteredJobs.length > 0 ? (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Company</th>
                                <th>Position</th>
                                <th>Status</th>
                                <th>Applied Date</th>
                                <th>Follow-up</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredJobs.map(job => (
                                <tr key={job._id}>
                                    <td>
                                        <div className={styles.companyName}>{job.companyName}</div>
                                    </td>
                                    <td>{job.jobTitle}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${getStatusColor(job.status)}`}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        {job.followUpDate ? new Date(job.followUpDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td>
                                        <button
                                            className={styles.viewBtn}
                                            onClick={() => setSelectedJobId(job._id)}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className={styles.empty}>
                    <p>No applications found. Start by adding a new job!</p>
                </div>
            )}

            {isModalOpen && (
                <AddJobModal
                    onClose={() => setIsModalOpen(false)}
                    onJobAdded={fetchJobs}
                />
            )}

            {selectedJobId && (
                <JobDetailsModal
                    jobId={selectedJobId}
                    onClose={() => setSelectedJobId(null)}
                    onJobUpdated={fetchJobs}
                />
            )}

            {isShareModalOpen && (
                <ShareModal onClose={() => setIsShareModalOpen(false)} />
            )}
        </div>
    );
};

export default Jobs;
