import pool from '../../db/config.js'

const getAllRoles = async () => {
  const { rows } = await pool.query('SELECT * FROM roles ORDER BY id ASC');
  return rows;
};

const getRoleById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
  return rows[0];
};

const createRole = async ({ nombre }) => {
  const { rows } = await pool.query(
    'INSERT INTO roles (nombre) VALUES ($1) RETURNING *',
    [nombre]
  );
  return rows[0];
};

const updateRole = async (id, { nombre }) => {
  const { rows } = await pool.query(
    'UPDATE roles SET nombre=$1 WHERE id=$2 RETURNING *',
    [nombre, id]
  );
  return rows[0];
};

const deleteRole = async (id) => {
  await pool.query('DELETE FROM roles WHERE id=$1', [id]);
  return { message: 'Rol eliminado' };
};

export default { getAllRoles, getRoleById, createRole, updateRole, deleteRole };
