import { Router } from 'express';
import { editPassword } from '../controllers/profile.controller';

const router = Router();

router.put('/password', editPassword);

export default router;