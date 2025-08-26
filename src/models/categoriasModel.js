import pool from '../../db/config.js'

const getAllCategorias = async () => {
  const { rows } = await pool.query('SELECT * FROM categorias ORDER BY id ASC');
  return rows;
};

const getCategoriaById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM categorias WHERE id = $1', [id]);
  return rows[0];
};

const createCategoria = async ({ nombre }) => {
  const { rows } = await pool.query('INSERT INTO categorias (nombre) VALUES ($1) RETURNING *', [nombre]);
  return rows[0];
};

const updateCategoria = async (id, { nombre }) => {
  const { rows } = await pool.query('UPDATE categorias SET nombre=$1 WHERE id=$2 RETURNING *', [nombre, id]);
  return rows[0];
};

const deleteCategoria = async (id) => {
  await pool.query('DELETE FROM categorias WHERE id=$1', [id]);
  return { message: 'Categoria eliminada' };
};

export default { getAllCategorias, getCategoriaById, createCategoria, updateCategoria, deleteCategoria };
