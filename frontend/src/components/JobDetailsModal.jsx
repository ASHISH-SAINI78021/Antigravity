import React, { useState, useEffect } from 'react';
import { X, Trash2, ExternalLink, Calendar, FileText, Building2, Briefcase, ChevronRight, CheckCircle, Clock, XCircle, AlertCircle, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import styles from './Modal.module.css';

const JobDetailsModal = ({ jobId, onClose, onJobUpdated }) => {
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchJobDetails();
    }, [jobId]);

    const fetchJobDetails = async () => {
        try {
            const res = await axios.get(`jobs/${jobId}`);
            setJob(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load job details');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            // Send only the status field for a surgical update
            await axios.put(`jobs/${jobId}`, { status: newStatus });
            setJob(prev => ({ ...prev, status: newStatus }));
            onJobUpdated();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this application?')) return;

        setDeleting(true);
        try {
            await axios.delete(`jobs/${jobId}`);
            onJobUpdated();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete job');
            setDeleting(false);
        }
    };

    const StatusIcon = ({ status }) => {
        switch (status) {
            case 'Applied': return <Clock size={16} />;
            case 'Interview': return <AlertCircle size={16} />;
            case 'Rejected': return <XCircle size={16} />;
            case 'Offer': return <Award size={16} />;
            default: return <CheckCircle size={16} />;
        }
    };

    if (loading) return (
        <div className={styles.overlay}>
            <div className={styles.modalSmall}>
                <div className={styles.loadingSpinner}></div>
                <p>Retrieving Data...</p>
            </div>
        </div>
    );

    if (!job) return (
        <div className={styles.overlay}>
            <div className={styles.modalSmall}>
                <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
                <div className={styles.errorBox}>
                    <p>{error || 'Job not found'}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={styles.premiumModal}
            >
                <button className={styles.premiumCloseBtn} onClick={onClose}>
                    <X size={20} />
                </button>

                <header className={styles.premiumHeader}>
                    <div className={styles.badgeWrapper}>
                        <div className={`${styles.statusPill} ${styles['status' + job.status]}`}>
                            <StatusIcon status={job.status} />
                            <span>{job.status}</span>
                        </div>
                    </div>

                    <div className={styles.mainInfo}>
                        <h2 className={styles.jobTitle}>{job.jobTitle}</h2>
                        <div className={styles.companyRow}>
                            <Building2 size={20} className={styles.icon} />
                            <span className={styles.companyNameText}>{job.companyName}</span>
                        </div>
                    </div>
                </header>

                <div className={styles.premiumGrid}>
                    <section className={styles.mainSection}>
                        <div className={styles.infoGroup}>
                            <h4 className={styles.sectionTitle}>Application Progress</h4>
                            <div className={styles.statusUpdateBox}>
                                <label>Current Stage</label>
                                <div className={styles.statusSelectWrapper}>
                                    <select
                                        value={job.status}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        className={styles.premiumSelect}
                                    >
                                        <option value="Saved">Saved</option>
                                        <option value="Applied">Applied</option>
                                        <option value="Interview">Interview</option>
                                        <option value="Rejected">Rejected</option>
                                        <option value="Offer">Offer</option>
                                    </select>
                                    <ChevronRight size={18} className={styles.selectArrow} />
                                </div>
                            </div>
                        </div>

                        <div className={styles.infoGroup}>
                            <h4 className={styles.sectionTitle}>Job Description</h4>
                            <div className={styles.notesContainer}>
                                {job.jobDescription ? (
                                    <p className={styles.notesText}>{job.jobDescription}</p>
                                ) : (
                                    <p className={styles.notesPlaceholder}>No description added...</p>
                                )}
                            </div>
                        </div>

                        <div className={styles.infoGroup}>
                            <h4 className={styles.sectionTitle}>Personal Notes</h4>
                            <div className={styles.notesContainer}>
                                {job.notes ? (
                                    <p className={styles.notesText}>{job.notes}</p>
                                ) : (
                                    <p className={styles.notesPlaceholder}>No notes added yet...</p>
                                )}
                            </div>
                        </div>
                    </section>

                    <aside className={styles.sidebarSection}>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}><Calendar size={14} /> Applied On</span>
                            <span className={styles.metaValue}>
                                {new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>

                        {job.followUpDate && (
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}><Clock size={14} /> Next Follow-up</span>
                                <span className={styles.metaValueHighlight}>
                                    {new Date(job.followUpDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        )}

                        {job.jobLink && (
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}><ExternalLink size={14} /> Posting</span>
                                <a href={job.jobLink} target="_blank" rel="noopener noreferrer" className={styles.premiumLink}>
                                    <span>External Link</span>
                                    <ChevronRight size={14} />
                                </a>
                            </div>
                        )}

                        {job.resumeUsed && (
                            <div className={styles.metaItem}>
                                <span className={styles.metaLabel}><FileText size={14} /> Resume Used</span>
                                <div className={styles.resumeBox}>
                                    <span className={styles.resumeName}>{job.resumeUsed.name}</span>
                                    <span className={styles.resumeVersion}>v{job.resumeUsed.version}</span>
                                </div>
                            </div>
                        )}

                        <div className={styles.dangerZone}>
                            <button
                                onClick={handleDelete}
                                className={styles.premiumDeleteBtn}
                                disabled={deleting}
                            >
                                <Trash2 size={16} />
                                <span>{deleting ? 'Deleting...' : 'Delete Application'}</span>
                            </button>
                        </div>
                    </aside>
                </div>
            </motion.div>
        </div>
    );
};

export default JobDetailsModal;
