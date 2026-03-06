import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, AlertCircle, CheckCircle2, ArrowRight, Building2, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import styles from './ImportPage.module.css';

const ImportPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [share, setShare] = useState(null);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchShareDetails();
    }, [token]);

    const fetchShareDetails = async () => {
        try {
            const res = await axios.get(`shares/${token}`);
            setShare(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired share link');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        setImporting(true);
        setError('');
        try {
            await axios.post(`shares/${token}/import`);
            setSuccess(true);
            setTimeout(() => navigate('/jobs'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to import applications');
            setImporting(false);
        }
    };

    if (loading) return (
        <div className={styles.container}>
            <div className={styles.loader}></div>
        </div>
    );

    return (
        <div className={styles.container}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={styles.card}
            >
                {!success ? (
                    <>
                        <div className={styles.iconWrapper}>
                            <Download size={40} />
                        </div>
                        <h1 className={styles.title}>Import Applications</h1>

                        {share ? (
                            <div className={styles.content}>
                                <div className={styles.infoBox}>
                                    <p className={styles.shareText}>
                                        <strong>{share.sharedBy}</strong> wants to share their job tracker data with you.
                                    </p>
                                    <div className={styles.stats}>
                                        <div className={styles.statItem}>
                                            <Briefcase size={20} />
                                            <span>{share.jobCount} Applications</span>
                                        </div>
                                    </div>

                                    <div className={styles.previewList}>
                                        <h4>Included Applications:</h4>
                                        <div className={styles.scrollArea}>
                                            {share.jobs?.map((j, idx) => (
                                                <div key={idx} className={styles.previewItemWrapper}>
                                                    <div className={styles.previewItem}>
                                                        <Building2 size={14} />
                                                        <span className={styles.previewTitle}>{j.jobTitle}</span>
                                                        <span className={styles.previewSlash}>at</span>
                                                        <span className={styles.previewCompany}>{j.companyName}</span>
                                                    </div>
                                                    {j.jobDescription && (
                                                        <p className={styles.previewDescription}>
                                                            {j.jobDescription.substring(0, 100)}
                                                            {j.jobDescription.length > 100 ? '...' : ''}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <p className={styles.disclaimer}>
                                    These applications will be added to your dashboard as 'Saved' jobs so you can track them yourself.
                                </p>

                                {error && (
                                    <div className={styles.errorBox}>
                                        <AlertCircle size={18} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className={styles.actions}>
                                    <button
                                        onClick={handleImport}
                                        className={styles.importBtn}
                                        disabled={importing}
                                    >
                                        {importing ? 'Importing...' : 'Add to My Dashboard'}
                                        <ArrowRight size={18} />
                                    </button>
                                    <button onClick={() => navigate('/jobs')} className={styles.cancelBtn}>
                                        Not now
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.errorState}>
                                <AlertCircle size={48} color="#ef4444" />
                                <h2>Link Invalid</h2>
                                <p>{error}</p>
                                <button onClick={() => navigate('/jobs')} className={styles.backBtn}>
                                    Go to Dashboard
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className={styles.successState}>
                        <CheckCircle2 size={64} color="#10b981" />
                        <h2>Successfully Imported!</h2>
                        <p>Redirecting you to your updated dashboard...</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ImportPage;
