const CollaborationRoom = require('../models/CollaborationRoom');
const SharedTask = require('../models/SharedTask');

// @desc    Create a collaboration room
// @route   POST /api/collaboration/rooms
// @access  Private
exports.createRoom = async (req, res, next) => {
    try {
        const room = await CollaborationRoom.create({
            name: req.body.name,
            createdBy: req.user.id,
            members: [req.user.id]
        });

        res.status(201).json({
            success: true,
            data: room
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Join a room by code
// @route   POST /api/collaboration/rooms/join
// @access  Private
exports.joinRoom = async (req, res, next) => {
    try {
        const room = await CollaborationRoom.findOne({ code: req.body.code.toUpperCase() });

        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        if (!room.members.includes(req.user.id)) {
            room.members.push(req.user.id);
            await room.save();
        }

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get user rooms
// @route   GET /api/collaboration/rooms
// @access  Private
exports.getUserRooms = async (req, res, next) => {
    try {
        const rooms = await CollaborationRoom.find({ members: req.user.id }).populate('members', 'name email');
        res.status(200).json({ success: true, data: rooms });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Get room tasks
// @route   GET /api/collaboration/rooms/:roomId/tasks
// @access  Private
exports.getRoomTasks = async (req, res, next) => {
    try {
        const tasks = await SharedTask.find({ room: req.params.roomId }).populate('createdBy', 'name').populate('assignedTo', 'name');
        res.status(200).json({ success: true, data: tasks });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Add task to room
// @route   POST /api/collaboration/rooms/:roomId/tasks
// @access  Private
exports.addTask = async (req, res, next) => {
    try {
        let task = await SharedTask.create({
            ...req.body,
            room: req.params.roomId,
            createdBy: req.user.id
        });

        // Populate createdBy to get the name for the UI
        task = await task.populate('createdBy', 'name');

        // Emit socket event for real-time update
        req.io.to(req.params.roomId).emit('task_added', task);

        res.status(201).json({
            success: true,
            data: task
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update task status/info
// @route   PUT /api/collaboration/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
    try {
        const task = await SharedTask.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('createdBy', 'name');

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Emit socket event
        req.io.to(task.room.toString()).emit('task_updated', task);

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete task
// @route   DELETE /api/collaboration/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
    try {
        const task = await SharedTask.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const roomId = task.room.toString();
        await task.deleteOne();

        // Emit socket event
        req.io.to(roomId).emit('task_deleted', req.params.id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
