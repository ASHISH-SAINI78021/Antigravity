const express = require('express');
const {
    getResumes,
    uploadResume,
    deleteResume
} = require('../controllers/resumes');
const { upload } = require('../config/cloudinary');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect);

router
    .route('/')
    .get(getResumes)
    .post(upload.single('resume'), uploadResume);

router
    .route('/:id')
    .delete(deleteResume);

module.exports = router;
