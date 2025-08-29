import model, { getContratosCliente, getSolicitudesDelTrabajador, getContratoDetalle, crearContratoDesdeCart, toggleLikeServicioDeContrato, getLikesItem, getLikesServicioTotal } from '../models/contratosModel.js'
import modelServicio from '../models/serviciosModel.js'
import modelPersona from '../models/personasModel.js'

const getAll = async (req, res) => {
  try {
    const data = await model.getAllContratos()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getById = async (req, res) => {
  try {
    const item = await model.getContratoById(req.params.id)
    if (!item) return res.status(404).json({ message: 'No encontrado' })
    res.json(item)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const create = async (req, res) => {
  try {
    console.log(req.body)
    console.log(req.query)
    const newItem = await model.createContrato(req.body)
    const detalle = req.body.items
    await model.insertContratoDetalle(newItem.id, detalle)
    newItem.detalle = detalle
    res.status(201).json(newItem)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const update = async (req, res) => {
  try {
    const updated = await model.updateContrato(req.params.id, req.body)
    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const remove = async (req, res) => {
  try {
    const deleted = await model.deleteContrato(req.params.id)
    res.json(deleted)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// === Contratos (carrito/detalle/valorar item) ===

export const solicitudesDelTrabajador = async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (id !== req.user.id && req.user.rol_id !== 1) return res.status(403).json({ message: 'Acceso denegado' })
    const data = await getSolicitudesDelTrabajador(id); return res.json(data)
  } catch (e) { return res.status(500).json({ error: e.message }) }
}

export const contratoDetalle = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const detalle = await getContratoDetalle(id)
    if (!detalle) return res.status(404).json({ message: 'Contrato no encontrado' })
    if (![req.user.rol_id === 1, detalle.cliente_id === req.user.id, detalle.trabajador_id === req.user.id].some(Boolean)) {
      return res.status(403).json({ message: 'Acceso denegado' })
    }
    return res.json(detalle)
  } catch (e) { return res.status(500).json({ error: e.message }) }
}

// ===================================================================================================================
// Nota personal: siempre fue mas facil ir dejando la ruta como aca para no enredarse...

// POST /contratos/from-cart
export async function crearDesdeCart (req, res) {
  try {
    if (!req.user?.id) return res.status(401).json({ ok: false, error: 'No autorizado' })
    const clienteId = req.user.id
    const cart = req.body?.cart
    const total = req.body?.total

    const result = await crearContratoDesdeCart(clienteId, cart, total)
    return res.status(201).json(result)
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || 'Error creando contrato' })
  }
}

// POST /contratos/:contratoId/servicios/:servicioId/like
export async function toggleLike (req, res) {
  try {
    if (!req.user?.id) return res.status(401).json({ ok: false, error: 'No autorizado' })
    const clienteId = Number(req.user.id)
    const contratoId = Number(req.params.contratoId)
    const servicioId = Number(req.params.servicioId)

    const result = await toggleLikeServicioDeContrato(clienteId, contratoId, servicioId)
    if (result?.error) return res.status(result.status || 400).json({ ok: false, error: result.error })
    return res.status(200).json({ ok: true, ...result })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || 'Error al aplicar like' })
  }
}

// GET /contratos/:contratoId/servicios/:servicioId/likes
export async function contarLikesItem (req, res) {
  try {
    const contratoId = Number(req.params.contratoId)
    const servicioId = Number(req.params.servicioId)
    const result = await getLikesItem(contratoId, servicioId)
    if (result?.error) return res.status(result.status || 400).json({ ok: false, error: result.error })
    return res.status(200).json({ ok: true, ...result })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || 'Error al obtener likes' })
  }
}

// GET /servicios/:servicioId/likes
export async function contarLikesServicio (req, res) {
  try {
    const servicioId = Number(req.params.servicioId)
    const result = await getLikesServicioTotal(servicioId)
    return res.status(200).json({ ok: true, ...result })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || 'Error al obtener likes por servicio' })
  }
}

export const contratosDelCliente = async (req, res) => {
  try {
    const id = Number(req.params.id)
    const data = await getContratosCliente(id)
    for (const contrato of data) {
      const detalle = await getContratoDetalle(contrato.id)
      contrato.detalle = detalle
      for (const item of detalle) {
        const servicio = await modelServicio.getServicioById(item.servicio_id)
        item.servicio = servicio
        item.servicio.trabajador = await modelPersona.getPersonaById(servicio.trabajador_id)
      }
    }
    return res.json(data)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}

// export const contratosDelCliente = async (req, res) => {
//   try {
//     const clienteId = Number(req.params.id)
//     if (!Number.isFinite(clienteId)) {
//       return res.status(400).json({ message: 'Cliente id inválido' })
//     }
//     const data = await getContratosCliente(clienteId)
//     return res.json(data) // ← ya es el arreglo mockContratos
//   } catch (e) {
//     return res.status(500).json({ error: e.message })
//   }
// }

export default { getAll, getById, create, update, remove, contratosDelCliente, solicitudesDelTrabajador, contratoDetalle }
