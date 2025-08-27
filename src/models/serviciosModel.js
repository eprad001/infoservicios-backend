import pool from '../../db/config.js'

const getAllServicios = async () => {
  const { rows } = await pool.query('SELECT * FROM servicios ORDER BY id ASC');
  return rows;
};

const getServicioById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM servicios WHERE id = $1', [id]);
  return rows[0];
};

const createServicio = async ({ titulo, descripcion, detalle, precio, foto, activo, trabajador_id, categoria_id, valoracion }) => {
  const { rows } = await pool.query(
    `INSERT INTO servicios (titulo, descripcion, detalle, precio, foto, activo, trabajador_id, categoria_id, valoracion) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [titulo, descripcion, detalle, precio, foto, activo, trabajador_id, categoria_id, valoracion]
  );
  return rows[0];
};

const updateServicio = async (id, { titulo, descripcion, detalle, precio, foto, activo, trabajador_id, categoria_id, valoracion }) => {
  const { rows } = await pool.query(
    `UPDATE servicios SET titulo=$1, descripcion=$2, detalle=$3, precio=$4, foto=$5, activo=$6, trabajador_id=$7, categoria_id=$8, valoracion=$9 WHERE id=$10 RETURNING *`,
    [titulo, descripcion, detalle, precio, foto, activo, trabajador_id, categoria_id, valoracion, id]
  );
  return rows[0];
};

const deleteServicio = async (id) => {
  await pool.query('DELETE FROM servicios WHERE id = $1', [id]);
  return { message: 'Servicio eliminado' };
};


// ======= Extras ======

export const getServiciosDisponibles = async () => {
  const { rows } = await pool.query(
    `SELECT s.*, c.nombre AS categoria_nombre, t.nombre AS trabajador_nombre, t.ap_paterno AS trabajador_ap_paterno, t.ap_materno AS trabajador_ap_materno
    FROM servicios s
    LEFT JOIN categorias c ON c.id = s.categoria_id
    LEFT JOIN personas   t ON t.id = s.trabajador_id
    WHERE s.activo = TRUE
    ORDER BY s.id ASC`);
  return rows;
};

export const getServiciosDelTrabajador = async (trabajadorId) => {
  const { rows } = await pool.query( `SELECT s.*, c.nombre AS categoria_nombre FROM servicios s LEFT JOIN categorias c ON c.id = s.categoria_id WHERE s.trabajador_id = $1 ORDER BY s.id ASC`, [trabajadorId] ); 
  return rows;
};

export const setServicioActivo = async (servicioId, activo) => {
  const { rows } = await pool.query( `UPDATE servicios SET activo=$2 WHERE id=$1 RETURNING *`, [servicioId, activo]);
  return rows[0];
};

export const getServiciosByIds = async (ids) => {
  if (!ids?.length) return [];
  const { rows } = await pool.query( `SELECT id, precio, trabajador_id, activo FROM servicios WHERE id = ANY($1::int[])`, [ids]);
  return rows;
};


export default { getAllServicios, getServicioById, createServicio, updateServicio, deleteServicio };
