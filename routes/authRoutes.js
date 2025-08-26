import { Router } from 'express';
import controller from '../src/controllers/authController.js';
import auth from '../middleware/auth.js';
const router = Router();

router.post('/register', controller.register);
router.post('/login', controller.login);

// Perfil del usuario autenticado
router.get('/me', auth, controller.me);

export default router;