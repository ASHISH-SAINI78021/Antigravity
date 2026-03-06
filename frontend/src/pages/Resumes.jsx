import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Trash2, FileText, CheckCircle2 } from 'lucide-react';
import styles from './Resumes.module.css';

const Resumes = () => {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [resumeName, setResumeName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const res = await axios.get('resumes');
            setResumes(res.data.data);
        } catch (err) {
            console.error('Error fetching resumes', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        if (e.target.files[0] && !resumeName) {
            setResumeName(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setError('');
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('resumeName', resumeName);

        try {
            await axios.post('resumes', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFile(null);
            setResumeName('');
            fetchResumes();
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this resume?')) return;
        try {
            await axios.delete(`resumes/${id}`);
            fetchResumes();
        } catch (err) {
            console.error('Delete failed', err);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>My Resumes</h1>
                    <p>Upload and manage different versions of your resume</p>
                </div>
            </header>

            <div className={styles.uploadSection}>
                <form onSubmit={handleUpload} className={styles.uploadCard}>
                    <h3>Upload New Version</h3>
                    <div className={styles.formGroup}>
                        <label>Resume Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Frontend Engineer - v1"
                            value={resumeName}
                            onChange={(e) => setResumeName(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.dropZone}>
                        <input
                            type="file"
                            id="resume-upload"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className={styles.fileInput}
                        />
                        <label htmlFor="resume-upload" className={styles.fileLabel}>
                            <Upload className={styles.uploadIcon} />
                            {file ? (
                                <span className={styles.fileName}>{file.name}</span>
                            ) : (
                                <span>Click to upload PDF or Word doc</span>
                            )}
                        </label>
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" disabled={!file || uploading} className={styles.uploadBtn}>
                        {uploading ? 'Uploading...' : 'Upload Resume'}
                    </button>
                </form>
            </div>

            <div className={styles.resumeList}>
                <h3>Your Resumes ({resumes.length})</h3>
                {loading ? (
                    <p>Loading resumes...</p>
                ) : resumes.length > 0 ? (
                    <div className={styles.grid}>
                        {resumes.map(resume => (
                            <div key={resume._id} className={styles.resumeCard}>
                                <div className={styles.cardHeader}>
                                    <FileText className={styles.docIcon} size={32} />
                                    <div className={styles.cardActions}>
                                        <button onClick={() => handleDelete(resume._id)} className={styles.deleteBtn}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.cardBody}>
                                    <h4>{resume.resumeName}</h4>
                                    <p>Uploaded: {new Date(resume.createdAt).toLocaleDateString()}</p>
                                </div>
                                <a href={resume.resumeUrl} target="_blank" rel="noopener noreferrer" className={styles.viewLink}>
                                    View Document
                                </a>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.empty}>
                        <CheckCircle2 size={48} className={styles.emptyIcon} />
                        <p>No resumes uploaded yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Resumes;
