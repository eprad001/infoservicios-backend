import model from '../models/contratosModel.js';

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

export default { getAll, getById, create, update, remove, contratosDelCliente, solicitudesDelTrabajador, checkoutContratos, contratoDetalle, valorarContratoItem};

// === [merged] Contratos (carrito/detalle/valorar item) ===
import { getContratosCliente, getSolicitudesDelTrabajador, crearContratosDesdeCarrito, getContratoDetalle, valorarItem } from '../models/contratosModel.js';
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
export const checkoutContratos = async (req, res) => {
  try { const { cliente_id, items } = req.body;
        if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'items requeridos' });
        if (Number(cliente_id) !== req.user.id && req.user.rol_id !== 1) return res.status(403).json({ message: 'Acceso denegado' });
        const creados = await crearContratosDesdeCarrito(Number(cliente_id), items);
        return res.status(201).json({ contratos: creados }); }
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
export const valorarContratoItem = async (req, res) => {
  try { const contratoId = Number(req.params.contratoId); const itemId = Number(req.params.itemId); const { puntos } = req.body;
        if (!Number.isFinite(puntos) || puntos <= 0) return res.status(400).json({ message: 'puntos debe ser > 0' });
        const updated = await valorarItem(req.user.id, contratoId, itemId, puntos);
        if (!updated) return res.status(404).json({ message: 'Item no encontrado o no pertenece a tu contrato' });
        return res.json(updated); }
  catch (e) { return res.status(500).json({ error: e.message }); }
};
