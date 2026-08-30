import express from 'express';

import sampleRoutes from './sampleRoute.js';
import agentReadyRoutes from './agentReadyRoute.js';

// Set up router
const router = express.Router();

router.use('/sample', sampleRoutes);
router.use('/agentready', agentReadyRoutes);

// export the router
export default router;