import { Router } from 'express';
import { ratingController } from '../controllers/rating.controller';

const router = Router();

// Worker ratings are also exposed under /workers/:workerId/ratings.
// This file exists for any standalone rating routes if needed.

export default router;