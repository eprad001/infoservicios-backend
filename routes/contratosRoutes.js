import { authorize, selfOrRoles, ROLES } from '../middleware/roles.js'
import { Router } from 'express'
import controller, { crearDesdeCart, toggleLike, contarLikesItem, contarLikesServicio } from '../src/controllers/contratosController.js'

import auth from '../middleware/auth.js'
const router = Router()

router.get('/', auth, authorize(ROLES.ADMIN, ROLES.TRABAJADOR, ROLES.CLIENTE), controller.getAll)
router.get('/:id', auth, authorize(ROLES.ADMIN, ROLES.TRABAJADOR, ROLES.CLIENTE), controller.getById)
router.post('/', auth, authorize(ROLES.CLIENTE), controller.create)
router.put('/:id', auth, authorize(ROLES.ADMIN, ROLES.TRABAJADOR, ROLES.CLIENTE), controller.update)
router.delete('/:id', auth, authorize(ROLES.ADMIN, ROLES.CLIENTE), controller.remove)

// Contratos (cliente/trabajador + checkout/valoración) ¿dividir y migrar a archivos separados...? pendiente por ahora
router.get('/cliente/:id', auth, authorize(ROLES.CLIENTE), controller.contratosDelCliente)
router.get('/trabajador/:id/solicitudes', auth, selfOrRoles('id', ROLES.ADMIN), controller.solicitudesDelTrabajador)
router.get('/detalle/:id', auth, controller.contratoDetalle)

router.post('/contratos/from-cart', auth, crearDesdeCart)
router.post('/contratos/:contratoId/servicios/:servicioId/like', auth, toggleLike)
router.get('/contratos/:contratoId/servicios/:servicioId/likes', auth, contarLikesItem)
router.get('/servicios/:servicioId/likes', contarLikesServicio)

export default router
