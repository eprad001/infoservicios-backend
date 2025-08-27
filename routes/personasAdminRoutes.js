// routes/personasAdminRoutes.js
import { Router } from 'express';
import { auth, authorize, ROLES } from '../middleware/auth.js';
import { adminCrearTrabajadorPersona, adminCrearServicioParaTrabajador, adminAsignarServicioATrabajador, adminListarTrabajadoresServicios, adminDeshabilitarTrabajador, adminListarClientes, adminDeshabilitarCliente } from '../src/controllers/personasAdminController.js';
const router = Router();

// Trabajadores (admin)
router.get('/admin/personas/trabajadores', auth, authorize(ROLES.ADMI), adminListarTrabajadoresServicios);
router.post('/admin/personas/trabajadores', auth, authorize(ROLES.ADMIN), adminCrearTrabajadorPersona);
router.post('/admin/personas/:trabajadorId/servicios', auth, authorize(ROLES.ADMIN), adminCrearServicioParaTrabajador);
router.patch('/admin/personas/servicios/:servicioId/asignar', auth, authorize(ROLES.ADMIN), adminAsignarServicioATrabajador);
router.patch('/admin/personas/trabajadores/:trabajadorId/deshabilitar', auth, authorize(ROLES.ADMIN), adminDeshabilitarTrabajador);

// Clientes (admin)
router.get('/admin/personas/clientes', auth, adminListarClientes);
router.patch('/admin/personas/clientes/:clienteId/deshabilitar', auth, adminDeshabilitarCliente);

export default router;
