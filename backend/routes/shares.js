const express = require('express');
const {
    generateShare,
    getShare,
    importJobs
} = require('../controllers/shares');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/generate', generateShare);
router.get('/:token', getShare);
router.post('/:token/import', importJobs);

module.exports = router;
