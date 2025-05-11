import { Router } from 'express';
import { editPassword } from '../controllers/profile.controller';

const router = Router();

// Update the user’s password
router.put('/password', editPassword);

export default router;
