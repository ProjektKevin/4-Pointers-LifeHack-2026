import express from 'express';

import * as agentReadyController from '../controllers/agentReadyController.js';

const router = express.Router();

// ----- Routes -----
router.post('/parse-query', agentReadyController.parseQuery);
router.post('/summarize', agentReadyController.summarizeProduct);
router.post('/enrich-import', agentReadyController.enrichImport);
router.post('/rank-relevance', agentReadyController.rankRelevance);

export default router;
