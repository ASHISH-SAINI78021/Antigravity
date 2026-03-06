import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, AlertCircle } from 'lucide-react';
import styles from './PrepHub.module.css';

const JoinRoom = () => {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        const join = async () => {
            try {
                const res = await axios.post('collaboration/rooms/join', { code: roomCode });
                navigate(`/prep/${res.data.data._id}`);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to join room. The link might be invalid.');
            }
        };

        if (roomCode) {
            join();
        }
    }, [roomCode, navigate]);

    if (error) {
        return (
            <div className={styles.container} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div className={styles.modal} style={{ textAlign: 'center', maxWidth: '400px' }}>
                    <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Join Failed</h2>
                    <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>{error}</p>
                    <button
                        onClick={() => navigate('/prep')}
                        className={styles.submitBtn}
                        style={{ width: '100%' }}
                    >
                        Back to Prep Hub
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <Loader2 className={styles.loadingIcon} size={48} style={{ animation: 'spin 1s linear infinite', color: '#6366f1', marginBottom: '1rem' }} />
            <h2 style={{ color: '#fff' }}>Joining Room...</h2>
            <p style={{ color: '#94a3b8' }}>Please wait while we connect you to the session.</p>
            <style>
                {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
            </style>
        </div>
    );
};

export default JoinRoom;
