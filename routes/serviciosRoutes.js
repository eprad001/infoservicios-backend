import { authorize, selfOrRoles, ROLES } from '../middleware/roles.js';
import { Router } from 'express';
const router = Router();
import controller from '../src/controllers/serviciosController.js';
import auth from '../middleware/auth.js';

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', auth, authorize(ROLES.ADMIN), controller.create);
router.put('/:id', auth, authorize(ROLES.ADMIN), controller.update);
router.delete('/:id', auth, authorize(ROLES.ADMIN), controller.remove);

// Rutas extras de servicios (separarlo en 2 archivos...?)
router.get('/disponibles', auth, controller.serviciosDisponibles);
router.get('/trabajador/:id', auth, selfOrRoles('id', ROLES.ADMIN), controller.serviciosDelTrabajador);
router.patch('/:id/activo', auth, authorize(ROLES.ADMIN), controller.toggleServicio);

export default router;
