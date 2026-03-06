const express = require('express');
const {
    createRoom,
    joinRoom,
    getUserRooms,
    getRoomTasks,
    addTask,
    updateTask,
    deleteTask
} = require('../controllers/collaboration');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/rooms')
    .get(getUserRooms)
    .post(createRoom);

router.post('/rooms/join', joinRoom);

router.route('/rooms/:roomId/tasks')
    .get(getRoomTasks)
    .post(addTask);

router.route('/tasks/:id')
    .put(updateTask)
    .delete(deleteTask);

module.exports = router;
