import express from 'express';

import * as sampleController from '../controllers/sampleController.js';

const router = express.Router();

// ----- Routes -----
router.get('/:sampleId', sampleController.getSampleData);


export default router;