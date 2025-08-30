import { authorize, selfOrRoles, ROLES } from '../middleware/roles.js';
import { Router } from 'express';
import controller from '../src/controllers/personasController.js';
import auth from '../middleware/auth.js';
const router = Router();

// CRUD Personas
router.get('/', auth, authorize(ROLES.ADMIN), controller.getAll)
router.get('/:id', auth, selfOrRoles('id', ROLES.ADMIN), controller.getById)
router.post('/', auth, authorize(ROLES.ADMIN), controller.create)
router.put('/:id', auth, selfOrRoles('id', ROLES.ADMIN), controller.update)
router.delete('/:id', auth, authorize(ROLES.ADMIN), controller.remove)

// CRUD por roles (pensando en separarlo a archivo roles fuera de persona si crece mucho...)

router.post('/trabajadores', auth, authorize(ROLES.ADMIN), controller.adminCrearTrabajador)
router.put('/trabajadores/:id', auth, authorize(ROLES.ADMIN), controller.adminEditarTrabajador)

router.get('/clientes/:id/perfil', auth, selfOrRoles('id', ROLES.ADMIN), controller.verPerfilCliente)
router.put('/clientes/:id/perfil', auth, selfOrRoles('id', ROLES.ADMIN), controller.editarPerfilCliente)
router.patch('/clientes/:id/activo', auth, authorize(ROLES.ADMIN), controller.adminToggleCliente)

router.get('/trabajadores/:id/perfil', auth, selfOrRoles('id', ROLES.ADMIN), controller.verPerfilTrabajador)
router.put('/trabajadores/:id/perfil', auth, selfOrRoles('id', ROLES.ADMIN), controller.editarPerfilTrabajador)
router.patch('/trabajadores/:id/activo', auth, authorize(ROLES.ADMIN), controller.adminToggleTrabajador)

export default router
