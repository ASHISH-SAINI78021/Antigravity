const express = require('express');
const {
    register,
    login,
    logout,
    getMe
} = require('../controllers/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../utils/validation');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;
