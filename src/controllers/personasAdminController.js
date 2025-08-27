import {crearTrabajadorPersona, assertEsTrabajador, crearServicioParaTrabajador, asignarServicioATrabajador, listarTrabajadoresConServicios, listarClientes, deshabilitarTrabajador, deshabilitarCliente} from '../models/personasAdminModel.js';

// rol_id = 1 aguante mientras lo hago centralizado...
function requireAdmin(req) {
  if (!req.user?.id) {
    const err = new Error('No autorizado');
    err.status = 401;
    throw err;
  }
  if (Number(req.user.rol_id) !== 1) {
    const err = new Error('Acceso restringido a administradores');
    err.status = 403;
    throw err;
  }
}

// Trabajadores que dicen que trabajan =================================================================
export async function adminCrearTrabajadorPersona(req, res) {
  try {
    requireAdmin(req);
    const body = req.body || {};
    if (!body.correo || !body.password || !body.nombre) {
      return res.status(400).json({ ok: false, error: 'correo, password y nombre son requeridos' });
    }
    const nuevo = await crearTrabajadorPersona(body);
    return res.status(201).json({ ok: true, trabajador: nuevo });
  } catch (e) {
    const code = e.status || 500;
    return res.status(code).json({ ok: false, error: e.message || 'Error al crear trabajador' });
  }
}

export async function adminCrearServicioParaTrabajador(req, res) {
  try {
    requireAdmin(req);
    const trabajadorId = Number(req.params.trabajadorId);
    const body = req.body || {};
    if (!trabajadorId) return res.status(400).json({ ok: false, error: 'TrabajadorId inválido' });
    if (!body.titulo) return res.status(400).json({ ok: false, error: 'Titulo es requerido' });

    const esTrabajador = await assertEsTrabajador(trabajadorId);
    if (!esTrabajador) return res.status(404).json({ ok: false, error: 'Trabajador no encontrado' });

    const svc = await crearServicioParaTrabajador(trabajadorId, body);
    return res.status(201).json({ ok: true, servicio: svc });
  } catch (e) {
    const code = e.status || 500;
    return res.status(code).json({ ok: false, error: e.message || 'Error al crear servicio' });
  }
}

export async function adminAsignarServicioATrabajador(req, res) {
  try {
    requireAdmin(req);
    const servicioId = Number(req.params.servicioId);
    const trabajadorId = Number(req.body?.trabajador_id);
    if (!servicioId || !trabajadorId) {
      return res.status(400).json({ ok: false, error: 'ServicioId y trabajador_id son requeridos' });
    }

    const esTrabajador = await assertEsTrabajador(trabajadorId);
    if (!esTrabajador) return res.status(404).json({ ok: false, error: 'Trabajador no encontrado' });

    const svc = await asignarServicioATrabajador(servicioId, trabajadorId);
    if (!svc) return res.status(404).json({ ok: false, error: 'Servicio no encontrado' });

    return res.json({ ok: true, servicio: svc });
  } catch (e) {
    const code = e.status || 500;
    return res.status(code).json({ ok: false, error: e.message || 'Error al asignar servicio' });
  }
}

export async function adminListarTrabajadoresServicios(req, res) {
  try {
    requireAdmin(req);
    const { q } = req.query;
    let activo = null;
    if (typeof req.query.activo !== 'undefined') {
      const v = String(req.query.activo).toLowerCase();
      if (v === 'true' || v === '1') activo = true;
      if (v === 'false' || v === '0') activo = false;
    }

    const data = await listarTrabajadoresConServicios({ q, activo });
    return res.json(data);
  } catch (e) {
    const code = e.status || 500;
    return res.status(code).json({ ok: false, error: e.message || 'Error al listar trabajadores' });
  }
}

export async function adminDeshabilitarTrabajador(req, res) {
  try {
    requireAdmin(req);
    const trabajadorId = Number(req.params.trabajadorId);
    if (!trabajadorId) return res.status(400).json({ ok: false, error: 'trabajadorId inválido' });

    const updated = await deshabilitarTrabajador(trabajadorId);
    if (!updated) return res.status(404).json({ ok: false, error: 'Trabajador no encontrado' });

    return res.json({ ok: true, trabajador: updated });
  } catch (e) {
    const code = e.status || 500;
    return res.status(code).json({ ok: false, error: e.message || 'Error al deshabilitar trabajador' });
  }
}

// Clientes que luego se van a quejar del servicio ======================================================================
export async function adminListarClientes(req, res) {
  try {
    requireAdmin(req);
    const { q } = req.query;
    let activo = null;
    if (typeof req.query.activo !== 'undefined') {
      const v = String(req.query.activo).toLowerCase();
      if (v === 'true' || v === '1') activo = true;
      if (v === 'false' || v === '0') activo = false;
    }
    const data = await listarClientes({ q, activo });
    return res.json(data);
  } catch (e) {
    const code = e.status || 500;
    return res.status(code).json({ ok: false, error: e.message || 'Error al listar clientes' });
  }
}

export async function adminDeshabilitarCliente(req, res) {
  try {
    requireAdmin(req);
    const clienteId = Number(req.params.clienteId);
    if (!clienteId) return res.status(400).json({ ok: false, error: 'clienteId inválido' });

    const updated = await deshabilitarCliente(clienteId);
    if (!updated) return res.status(404).json({ ok: false, error: 'Cliente no encontrado' });

    return res.json({ ok: true, cliente: updated });
  } catch (e) {
    const code = e.status || 500;
    return res.status(code).json({ ok: false, error: e.message || 'Error al deshabilitar cliente' });
  }
}
