import * as express from 'express';
import { Request, Response, NextFunction, Router } from 'express';

// import { Comment } from '../models/Comment';
// import logger from '../config/winston_config';

const router: Router = express.Router();
const version: string = '1.0.0';

router.get('/', (_req: Request, res: Response, _next: NextFunction) => res.status(200).json({ version }));

export default router;
