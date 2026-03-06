import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, ArrowRight, Hash, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import styles from './PrepHub.module.css';

const PrepHub = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const res = await axios.get('collaboration/rooms');
            setRooms(res.data.data);
        } catch (err) {
            console.error('Error fetching rooms', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('collaboration/rooms', { name: roomName });
            navigate(`/prep/${res.data.data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create room');
        }
    };

    const handleJoinRoom = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('collaboration/rooms/join', { code: roomCode });
            navigate(`/prep/${res.data.data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join room');
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>Prep Hub 🤝</h1>
                    <p>Collaborate with friends to prepare for your dream jobs.</p>
                </div>
                <div className={styles.actions}>
                    <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
                        <Plus size={20} />
                        Create Room
                    </button>
                    <button className={styles.joinBtn} onClick={() => setShowJoinModal(true)}>
                        <LogIn size={20} />
                        Join with Code
                    </button>
                </div>
            </header>

            {loading ? (
                <div className={styles.loading}>Loading collaboration rooms...</div>
            ) : rooms.length > 0 ? (
                <div className={styles.roomGrid}>
                    {rooms.map((room) => (
                        <motion.div
                            key={room._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={styles.roomCard}
                            onClick={() => navigate(`/prep/${room._id}`)}
                        >
                            <div className={styles.roomInfo}>
                                <h3>{room.name}</h3>
                                <p className={styles.memberCount}>
                                    <Users size={14} />
                                    {room.members.length} members
                                </p>
                            </div>
                            <div className={styles.roomCode}>
                                <Hash size={14} />
                                <span>{room.code}</span>
                            </div>
                            <ArrowRight className={styles.arrow} />
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className={styles.empty}>
                    <Users size={64} className={styles.emptyIcon} />
                    <h2>No rooms yet</h2>
                    <p>Create a room and invite your friends to start preparing together!</p>
                </div>
            )}

            {/* Create Room Modal */}
            {showCreateModal && (
                <div className={styles.modalOverlay}>
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={styles.modal}>
                        <h2>Create New Prep Room</h2>
                        <form onSubmit={handleCreateRoom}>
                            <input
                                type="text"
                                placeholder="Room Name (e.g., FAANG Prep)"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                required
                            />
                            {error && <p className={styles.error}>{error}</p>}
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className={styles.submitBtn}>Create</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Join Room Modal */}
            {showJoinModal && (
                <div className={styles.modalOverlay}>
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={styles.modal}>
                        <h2>Join Prep Room</h2>
                        <form onSubmit={handleJoinRoom}>
                            <input
                                type="text"
                                placeholder="Enter Room Code (e.g., A1B2)"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value)}
                                required
                            />
                            {error && <p className={styles.error}>{error}</p>}
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowJoinModal(false)}>Cancel</button>
                                <button type="submit" className={styles.submitBtn}>Join</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default PrepHub;
