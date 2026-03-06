import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import styles from './Modal.module.css';

const AddJobModal = ({ onClose, onJobAdded }) => {
    const [formData, setFormData] = useState({
        companyName: '',
        jobTitle: '',
        jobLink: '',
        status: 'Applied',
        followUpDate: '',
        notes: '',
        jobDescription: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post('jobs', formData);
            onJobAdded();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={20} />
                </button>
                <h2>Add New Application</h2>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.grid}>
                        <div className={styles.formGroup}>
                            <label>Company Name *</label>
                            <input
                                type="text" name="companyName" required
                                value={formData.companyName} onChange={handleChange}
                                placeholder="Google, Meta, etc."
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Job Title *</label>
                            <input
                                type="text" name="jobTitle" required
                                value={formData.jobTitle} onChange={handleChange}
                                placeholder="Software Engineer"
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Job Link</label>
                        <input
                            type="url" name="jobLink"
                            value={formData.jobLink} onChange={handleChange}
                            placeholder="https://linkedin.com/jobs/..."
                        />
                    </div>

                    <div className={styles.grid}>
                        <div className={styles.formGroup}>
                            <label>Status</label>
                            <select name="status" value={formData.status} onChange={handleChange}>
                                <option value="Saved">Saved</option>
                                <option value="Applied">Applied</option>
                                <option value="Interview">Interview</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Offer">Offer</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Follow-up Date</label>
                            <input
                                type="date" name="followUpDate"
                                value={formData.followUpDate} onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Job Description</label>
                        <textarea
                            name="jobDescription" rows="4"
                            value={formData.jobDescription} onChange={handleChange}
                            placeholder="Paste the job description or requirements here..."
                        ></textarea>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Personal Notes</label>
                        <textarea
                            name="notes" rows="3"
                            value={formData.notes} onChange={handleChange}
                            placeholder="Interviewer name, specific tech stack, etc."
                        ></textarea>
                    </div>

                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
                        <button type="submit" disabled={loading} className={styles.submitBtn}>
                            {loading ? 'Adding...' : 'Add Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddJobModal;
