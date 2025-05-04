import { Router } from 'express';
import {
  signup,
  signin,
  getUser,
  logout
} from '../controllers/auth.controller';

const router = Router();

router.post('/signup', signup);
router.post('/login', signin);
router.get('/me', getUser);
router.get('/logout', logout);

export default router;
