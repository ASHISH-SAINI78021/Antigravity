const express = require('express');
const {
    getJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob
} = require('../controllers/jobs');
const validate = require('../middleware/validate');
const { jobSchema, jobUpdateSchema } = require('../utils/validation');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

router
    .route('/')
    .get(getJobs)
    .post(validate(jobSchema), createJob);

router
    .route('/:id')
    .get(getJob)
    .put(validate(jobUpdateSchema), updateJob)
    .delete(deleteJob);

module.exports = router;
