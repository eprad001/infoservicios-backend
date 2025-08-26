import { Router } from 'express';
const router = Router();
import controller from '../src/controllers/categoriasController.js';
import auth from '../middleware/auth.js';
import { authorize, ROLES } from '../middleware/roles.js';

router.get('/', auth, authorize(ROLES.ADMIN, ROLES.CLIENTE, ROLES.TRABAJADOR), controller.getAll);
router.get('/:id', auth, authorize(ROLES.ADMIN, ROLES.CLIENTE, ROLES.TRABAJADOR), controller.getById);
router.post('/', auth, authorize(ROLES.ADMIN), controller.create);
router.put('/:id', auth, authorize(ROLES.ADMIN), controller.update);
router.delete('/:id', auth, authorize(ROLES.ADMIN), controller.remove);

export default router;
