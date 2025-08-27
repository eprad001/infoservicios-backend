import model from '../models/serviciosModel.js';
import { getServiciosDisponibles, setServicioActivo, getServiciosDelTrabajador } from '../models/serviciosModel.js';

const getAll = async (req, res) => {
  try {
    const data = await model.getAllServicios();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const item = await model.getServicioById(req.params.id);
    if (!item) return res.status(404).json({ message: 'No encontrado' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const newItem = await model.createServicio(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const updated = await model.updateServicio(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const deleted = await model.deleteServicio(req.params.id);
    res.json(deleted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ======== Servicios (disponibles/estado/del-trabajador) ========


export const serviciosDisponibles = async (_req, res) => {
  try { const data = await getServiciosDisponibles(); return res.json(data); }
  catch (e) { return res.status(500).json({ error: e.message }); }
};

export const serviciosDelTrabajador = async (req, res) => {
  try { const id = Number(req.params.id);
        if (id !== req.user.id && req.user.rol_id !== 1) return res.status(403).json({ message: 'Acceso denegado' });
        const data = await getServiciosDelTrabajador(id); return res.json(data); }
  catch (e) { return res.status(500).json({ error: e.message }); }
};

export const toggleServicio = async (req, res) => {
  try { const { id } = req.params; const { activo } = req.body; const out = await setServicioActivo(id, !!activo);
        if (!out) return res.status(404).json({ message: 'Servicio no encontrado' }); return res.json(out); }
  catch (e) { return res.status(500).json({ error: e.message }); }
};

export default { getAll, getById, create, update, remove, serviciosDisponibles, toggleServicio, serviciosDelTrabajador};