import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
    CheckCircle,
    Circle,
    Plus,
    Trash2,
    Users,
    Hash,
    ArrowLeft,
    Clock,
    User as UserIcon,
    AlertCircle,
    Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import styles from './PrepRoom.module.css';

const PrepRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);
    const socketRef = useRef();

    const handleShare = () => {
        const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
        console.log('Sharing Link Origin:', frontendUrl);
        const joinLink = `${frontendUrl}/prep/join/${room.code}`;
        navigator.clipboard.writeText(joinLink);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                // Fetch room basics
                const roomRes = await axios.get('collaboration/rooms');
                const currentRoom = roomRes.data.data.find(r => r._id === roomId);
                if (!currentRoom) throw new Error('Room not found');
                setRoom(currentRoom);

                // Fetch tasks
                const tasksRes = await axios.get(`collaboration/rooms/${roomId}/tasks`);
                setTasks(tasksRes.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load room');
            } finally {
                setLoading(false);
            }
        };

        fetchRoomData();

        // Socket.io Setup
        const socketUrl = import.meta.env.VITE_SOCKET_URL ||
            (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin);

        socketRef.current = io(socketUrl);

        socketRef.current.emit('join_room', roomId);

        socketRef.current.on('task_added', (task) => {
            setTasks(prev => {
                // Filter out any optimistic version of this task or duplicates
                const filtered = prev.filter(t => t.title !== task.title || !t.isOptimistic);
                return [...filtered, task];
            });
        });

        socketRef.current.on('task_updated', (updatedTask) => {
            setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
        });

        socketRef.current.on('task_deleted', (taskId) => {
            setTasks(prev => prev.filter(t => t._id !== taskId));
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [roomId]);

    const handleAddTask = async (e) => {
        e.preventDefault();
        const title = newTaskTitle.trim();
        if (!title) return;

        // Optimistic UI: Create a temporary task object
        const tempId = Date.now().toString();
        const optimisticTask = {
            _id: tempId,
            title,
            status: 'todo',
            createdBy: { name: 'You' }, // Fallback for instant display
            isOptimistic: true
        };

        setTasks(prev => [...prev, optimisticTask]);
        setNewTaskTitle('');

        try {
            await axios.post(`collaboration/rooms/${roomId}/tasks`, { title });
            // The real task will come through Socket.io and replace the optimistic one 
            // but we need to remove the temp one if using socket to prevent flashes.
            // Actually, we can just filter it out once the real one arrives or keep it until sync.
        } catch (err) {
            setTasks(prev => prev.filter(t => t._id !== tempId));
            console.error('Failed to add task', err);
        }
    };

    const toggleTaskStatus = async (task) => {
        const nextStatus = {
            'todo': 'in-progress',
            'in-progress': 'completed',
            'completed': 'todo'
        }[task.status];

        const originalStatus = task.status;

        // Optimistic UI update
        setTasks(prev => prev.map(t =>
            t._id === task._id ? { ...t, status: nextStatus } : t
        ));

        try {
            await axios.put(`collaboration/tasks/${task._id}`, {
                status: nextStatus
            });
        } catch (err) {
            // Revert on error
            setTasks(prev => prev.map(t =>
                t._id === task._id ? { ...t, status: originalStatus } : t
            ));
            console.error('Failed to update task', err);
        }
    };

    const handleDeleteTask = async (taskId) => {
        const originalTasks = [...tasks];

        // Optimistic UI update
        setTasks(prev => prev.filter(t => t._id !== taskId));

        try {
            await axios.delete(`collaboration/tasks/${taskId}`);
        } catch (err) {
            // Revert on error
            setTasks(originalTasks);
            console.error('Failed to delete task', err);
        }
    };

    if (loading) return <div className={styles.loading}>Connecting to live session...</div>;
    if (error) return (
        <div className={styles.errorContainer}>
            <AlertCircle size={48} />
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/prep')}>Back to Prep Hub</button>
        </div>
    );

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle className={styles.completedIcon} size={20} />;
            case 'in-progress': return <Clock className={styles.progressIcon} size={20} />;
            default: return <Circle className={styles.todoIcon} size={20} />;
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={() => navigate('/prep')}>
                    <ArrowLeft size={20} />
                </button>
                <div className={styles.info}>
                    <h1>{room?.name}</h1>
                    <div className={styles.meta}>
                        <div className={styles.codeBadge}>
                            <Hash size={14} />
                            <span>{room?.code}</span>
                        </div>
                        <div className={styles.memberBadge}>
                            <Users size={14} />
                            <span>{room?.members.length} Members Live</span>
                        </div>
                        <button
                            className={`${styles.shareBtnInline} ${copySuccess ? styles.success : ''}`}
                            onClick={handleShare}
                            title="Copy Share Link"
                        >
                            <Share2 size={14} />
                            <span>{copySuccess ? 'Link Copied!' : 'Share Link'}</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <section className={styles.inputSection}>
                    <form onSubmit={handleAddTask} className={styles.taskForm}>
                        <input
                            type="text"
                            placeholder="Add a task for preparation (e.g., Solve 2 LC Medium)"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                        />
                        <button type="submit" disabled={!newTaskTitle.trim()}>
                            <Plus size={20} />
                            Add Task
                        </button>
                    </form>
                </section>

                <div className={styles.taskList}>
                    <AnimatePresence mode='popLayout'>
                        {tasks.map((task) => (
                            <motion.div
                                key={task._id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`${styles.taskItem} ${styles[task.status]}`}
                            >
                                <button
                                    className={styles.statusBtn}
                                    onClick={() => toggleTaskStatus(task)}
                                >
                                    {getStatusIcon(task.status)}
                                </button>

                                <div className={styles.taskContent}>
                                    <p className={styles.taskTitle}>{task.title}</p>
                                    <div className={styles.taskMeta}>
                                        <UserIcon size={12} />
                                        <span>Added by {task.createdBy?.name || 'User'}</span>
                                    </div>
                                </div>

                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => handleDeleteTask(task._id)}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {tasks.length === 0 && (
                        <div className={styles.emptyTasks}>
                            <p>No tasks yet. Start by adding one above!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PrepRoom;
