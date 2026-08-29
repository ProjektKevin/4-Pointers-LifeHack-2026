import express from 'express';

import sampleRoutes from './sampleRoute.js';

// Set up router
const router = express.Router();

router.use('/sample', sampleRoutes);

// export the router
export default router;