import { authorize, selfOrRoles, ROLES } from '../middleware/roles.js';
import { Router } from 'express';
const router = Router();
import controller from '../src/controllers/contratosController.js';
import auth from '../middleware/auth.js';
import { authorize, ROLES } from '../middleware/roles.js';

router.get('/', auth, authorize(ROLES.ADMIN, ROLES.TRABAJADOR, ROLES.CLIENTE), controller.getAll);
router.get('/:id', auth, authorize(ROLES.ADMIN, ROLES.TRABAJADOR, ROLES.CLIENTE), controller.getById);
router.post('/', auth, authorize(ROLES.CLIENTE), controller.create);
router.put('/:id', auth, authorize(ROLES.ADMIN, ROLES.TRABAJADOR, ROLES.CLIENTE), controller.update);
router.delete('/:id', auth, authorize(ROLES.ADMIN, ROLES.CLIENTE), controller.remove);

// Contratos (cliente/trabajador + checkout/valoración) ¿dividir y migrar a archivos separados...? pendiente por ahora
router.get('/cliente/:id', auth, selfOrRoles('id', ROLES.ADMIN), controller.contratosDelCliente);
router.get('/trabajador/:id/solicitudes', auth, selfOrRoles('id', ROLES.ADMIN), controller.solicitudesDelTrabajador);
router.post('/checkout', auth, controller.checkoutContratos);
router.get('/detalle/:id', auth, controller.contratoDetalle);
router.post('/:contratoId/items/:itemId/valorar', auth, controller.valorarContratoItem);

export default router;
