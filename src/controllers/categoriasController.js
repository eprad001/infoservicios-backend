import model from '../models/categoriasModel.js'

const getAll = async (req, res) => {
  try {
    const data = await model.getAllCategorias()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getById = async (req, res) => {
  try {
    const item = await model.getCategoriaById(req.params.id)
    if (!item) return res.status(404).json({ message: 'No encontrado' })
    res.json(item)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const create = async (req, res) => {
  try {
    const newItem = await model.createCategoria(req.body)
    res.status(201).json(newItem)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const update = async (req, res) => {
  try {
    const updated = await model.updateCategoria(req.params.id, req.body)
    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const remove = async (req, res) => {
  try {
    const deleted = await model.deleteCategoria(req.params.id)
    res.json(deleted)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export default { getAll, getById, create, update, remove }
