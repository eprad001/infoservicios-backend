import model from '../models/contratosModel.js';
import { getContratosCliente, getSolicitudesDelTrabajador, getContratoDetalle } from '../models/contratosModel.js';
import { crearContratoDesdeCart, toggleLikeServicioDeContrato, getLikesItem, getLikesServicioTotal} from '../models/contratosModel.js';


const getAll = async (req, res) => {
  try {
    const data = await model.getAllContratos();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const item = await model.getContratoById(req.params.id);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const newItem = await model.createContrato(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const updated = await model.updateContrato(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const deleted = await model.deleteContrato(req.params.id);
    res.json(deleted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// === Contratos (carrito/detalle/valorar item) ===

export const contratosDelCliente = async (req, res) => {
  try { const id = Number(req.params.id);
        if (id !== req.user.id && req.user.rol_id !== 1) return res.status(403).json({ message: 'Acceso denegado' });
        const data = await getContratosCliente(id); return res.json(data); }
  catch (e) { return res.status(500).json({ error: e.message }); }
};

export const solicitudesDelTrabajador = async (req, res) => {
  try { const id = Number(req.params.id);
        if (id !== req.user.id && req.user.rol_id !== 1) return res.status(403).json({ message: 'Acceso denegado' });
        const data = await getSolicitudesDelTrabajador(id); return res.json(data); }
  catch (e) { return res.status(500).json({ error: e.message }); }
};

export const contratoDetalle = async (req, res) => {
  try { const id = Number(req.params.id);
        const detalle = await getContratoDetalle(id);
        if (!detalle) return res.status(404).json({ message: 'Contrato no encontrado' });
        if (![req.user.rol_id === 1, detalle.cliente_id === req.user.id, detalle.trabajador_id === req.user.id].some(Boolean)) {
          return res.status(403).json({ message: 'Acceso denegado' }); }
        return res.json(detalle); }
  catch (e) { return res.status(500).json({ error: e.message }); }
};

// ===================================================================================================================

/** POST /contratos/from-cart */
export async function crearDesdeCart(req, res) {
  try {
    if (!req.user?.id) return res.status(401).json({ ok: false, error: 'No autorizado' });
    const clienteId = req.user.id;
    const cart = req.body?.cart;
    const total = req.body?.total;

    const result = await crearContratoDesdeCart(clienteId, cart, total);
    return res.status(201).json(result);
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || 'Error creando contrato' });
  }
}

/** POST /contratos/:contratoId/servicios/:servicioId/like (toggle) */
export async function toggleLike(req, res) {
  try {
    if (!req.user?.id) return res.status(401).json({ ok: false, error: 'No autorizado' });
    const clienteId = Number(req.user.id);
    const contratoId = Number(req.params.contratoId);
    const servicioId = Number(req.params.servicioId);

    const result = await toggleLikeServicioDeContrato(clienteId, contratoId, servicioId);
    if (result?.error) return res.status(result.status || 400).json({ ok: false, error: result.error });
    return res.status(200).json({ ok: true, ...result });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || 'Error al aplicar like' });
  }
}

/** GET /contratos/:contratoId/servicios/:servicioId/likes */
export async function contarLikesItem(req, res) {
  try {
    const contratoId = Number(req.params.contratoId);
    const servicioId = Number(req.params.servicioId);
    const result = await getLikesItem(contratoId, servicioId);
    if (result?.error) return res.status(result.status || 400).json({ ok: false, error: result.error });
    return res.status(200).json({ ok: true, ...result });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || 'Error al obtener likes' });
  }
}

/** GET /servicios/:servicioId/likes */
export async function contarLikesServicio(req, res) {
  try {
    const servicioId = Number(req.params.servicioId);
    const result = await getLikesServicioTotal(servicioId);
    return res.status(200).json({ ok: true, ...result });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || 'Error al obtener likes por servicio' });
  }
}


export default { getAll, getById, create, update, remove, contratosDelCliente, solicitudesDelTrabajador, checkoutContratos, contratoDetalle};