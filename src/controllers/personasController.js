import bcrypt from 'bcryptjs'
import model, { getClientePerfil, updateClientePerfil, getTrabajadorPerfil, updateTrabajadorPerfil, setPersonaActiva, createTrabajador, updateTrabajadorAdmin } from '../models/personasModel.js'

import serviciosModel from '../models/serviciosModel.js'

const getAll = async (req, res) => {
  try {
    const data = await model.getAllPersonas()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getById = async (req, res) => {
  try {
    const item = await model.getPersonaById(req.params.id)
    if (!item) return res.status(404).json({ message: 'No encontrado' })
    res.json(item)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const create = async (req, res) => {
  try {
    const newItem = await model.createPersona(req.body)
    res.status(201).json(newItem)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const update = async (req, res) => {
  try {
    const updated = await model.updatePersona(req.params.id, req.body)
    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const remove = async (req, res) => {
  try {
    const deleted = await model.deletePersona(req.params.id)
    res.json(deleted)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// === Personas (roles/admin) ===

export const verPerfilCliente = async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (id !== req.user.id && req.user.rol_id !== 1) return res.status(403).json({ message: 'Acceso denegado' })
    const data = await getClientePerfil(id)
    if (!data) return res.status(404).json({ message: 'Cliente no encontrado' })
    return res.json(data)
  } catch (e) { return res.status(500).json({ error: e.message }) }
}

export const editarPerfilCliente = async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (id !== req.user.id && req.user.rol_id !== 1) return res.status(403).json({ message: 'Acceso denegado' })
    const { correo, nombre, ap_paterno, ap_materno, rut, telefono, password } = req.body
    if (correo) return res.status(400).json({ message: 'No está permitido cambiar el correo' })
    let passwordHashed
    if (password) passwordHashed = await bcrypt.hash(password, 10)
    const updated = await updateClientePerfil(id, { nombre, ap_paterno, ap_materno, rut, telefono, passwordHashed })
    return res.json(updated)
  } catch (e) { return res.status(500).json({ error: e.message }) }
}

export const verPerfilTrabajador = async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (id !== req.user.id && req.user.rol_id !== 1) return res.status(403).json({ message: 'Acceso denegado' })
    const data = await getTrabajadorPerfil(id)
    if (!data) return res.status(404).json({ message: 'Trabajador no encontrado' })
    return res.json(data)
  } catch (e) { return res.status(500).json({ error: e.message }) }
}

export const editarPerfilTrabajador = async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (id !== req.user.id && req.user.rol_id !== 1) return res.status(403).json({ message: 'Acceso denegado' })
    const { telefono, password, ...rest } = req.body
    if (Object.keys(rest).length) return res.status(400).json({ message: 'Solo se permite editar telefono y password' })
    let passwordHashed
    if (password) passwordHashed = await bcrypt.hash(password, 10)
    const updated = await updateTrabajadorPerfil(id, { telefono, passwordHashed })
    return res.json(updated)
  } catch (e) { return res.status(500).json({ error: e.message }) }
}

// Aqui ya se esta armando un desmadre ... hay que dividir entre personas y administracion de usuarios que tiene casi toda la logicaaaa... ;_;

export const adminToggleCliente = async (req, res) => {
  try {
    const { id } = req.params; const { activo } = req.body
    const out = await setPersonaActiva(id, !!activo, 2)
    if (!out) return res.status(404).json({ message: 'Cliente no encontrado' })
    return res.json(out)
  } catch (e) { return res.status(500).json({ error: e.message }) }
}

export const adminToggleTrabajador = async (req, res) => {
  try {
    const { id } = req.params; const { activo } = req.body
    const out = await setPersonaActiva(id, !!activo, 3)
    if (!out) return res.status(404).json({ message: 'Trabajador no encontrado' })
    return res.json(out)
  } catch (e) { return res.status(500).json({ error: e.message }) }
}

export const adminCrearTrabajador = async (req, res) => {
  try {
    const { correo, password, nombre, ap_paterno, ap_materno, rut, telefono, activo } = req.body
    if (!correo || !password) return res.status(400).json({ message: 'Correo y password son obligatorios' })
    const passwordHashed = await bcrypt.hash(password, 10)
    const out = await createTrabajador({ correo, passwordHashed, nombre, ap_paterno, ap_materno, rut, telefono, activo })
    const result = serviciosModel.insertServicio(out.id, req.servicios)
    out.servicios = result
    return res.status(201).json(out)
  } catch (e) { return res.status(500).json({ error: e.message }) }
}

export const adminEditarTrabajador = async (req, res) => {
  try {
    console.log(req.body)
    const { id } = req.params; const { password, servicios, ...fields } = req.body
    let passwordHashed = null
    if (password) passwordHashed = await bcrypt.hash(password, 10)
    const out = await updateTrabajadorAdmin(id, { ...fields, passwordHashed })
    const result = serviciosModel.insertServicio(id, servicios)
    out.servicios = result
    if (!out) return res.status(404).json({ message: 'Trabajador no encontrado' })
    return res.json(out)
  } catch (e) { return res.status(500).json({ error: e.message }) }
}

export default { getAll, getById, create, update, remove, verPerfilCliente, editarPerfilCliente, verPerfilTrabajador, editarPerfilTrabajador, adminToggleCliente, adminCrearTrabajador, adminEditarTrabajador, adminToggleTrabajador }
