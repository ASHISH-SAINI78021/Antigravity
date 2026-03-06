import React, { useState } from 'react';
import { X, Copy, Check, Share2, Globe, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import styles from './Modal.module.css';

const ShareModal = ({ onClose }) => {
    const [loading, setLoading] = useState(false);
    const [shareData, setShareData] = useState(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    const generateShareLink = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('shares/generate');
            setShareData(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate share link');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        const url = `${window.location.origin}/import/${shareData.token}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={styles.modal}
            >
                <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>

                <div className={styles.shareHeader}>
                    <div className={styles.shareIconCircle}>
                        <Share2 size={32} />
                    </div>
                    <h2>Share Applications</h2>
                    <p>Generate a secure link to let others import your job tracker data.</p>
                </div>

                {!shareData ? (
                    <div className={styles.shareAction}>
                        <div className={styles.shareInfoBox}>
                            <div className={styles.infoRow}>
                                <Globe size={18} />
                                <span>Anyone with the link can view your applications count</span>
                            </div>
                            <div className={styles.infoRow}>
                                <Shield size={18} />
                                <span>The link expires in 24 hours for security</span>
                            </div>
                        </div>
                        <button
                            onClick={generateShareLink}
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? 'Generating...' : 'Create Share Link'}
                        </button>
                    </div>
                ) : (
                    <div className={styles.shareResult}>
                        <label className={styles.urlLabel}>Your Shareable URL</label>
                        <div className={styles.urlBox}>
                            <input
                                readOnly
                                value={`${window.location.origin}/import/${shareData.token}`}
                            />
                            <button onClick={copyToClipboard} className={styles.copyBtn}>
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                        </div>
                        <p className={styles.shareSuccessTip}>
                            Share this link with your friends. They'll be able to add all {shareData.jobCount} applications to their dashboard.
                        </p>
                    </div>
                )}

                {error && <p className={styles.error}>{error}</p>}
            </motion.div>
        </div>
    );
};

export default ShareModal;
