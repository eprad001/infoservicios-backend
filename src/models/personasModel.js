import pool from '../../db/config.js'

const getAllPersonas = async () => {
  const { rows } = await pool.query('SELECT * FROM personas ORDER BY id ASC');
  return rows;
};

const getPersonaById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM personas WHERE id = $1', [id]);
  return rows[0];
};

const createPersona = async ({ correo, password, nombre, ap_paterno, ap_materno, rut, telefono, activo, rol_id }) => {
  const { rows } = await pool.query(
    `INSERT INTO personas (correo, password, nombre, ap_paterno, ap_materno, rut, telefono, activo, rol_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [correo, password, nombre, ap_paterno, ap_materno, rut, telefono, activo, rol_id]
  );
  return rows[0];
};

const updatePersona = async (id, { correo, password, nombre, ap_paterno, ap_materno, rut, telefono, activo, rol_id }) => {
  const { rows } = await pool.query(
    `UPDATE personas SET correo=$1, password=$2, nombre=$3, ap_paterno=$4, ap_materno=$5, rut=$6, telefono=$7, activo=$8, rol_id=$9 WHERE id=$10 RETURNING *`,
    [correo, password, nombre, ap_paterno, ap_materno, rut, telefono, activo, rol_id, id]
  );
  return rows[0];
};

const deletePersona = async (id) => {
  await pool.query('DELETE FROM personas WHERE id = $1', [id]);
  return { message: 'Persona eliminada' };
};

const getPersonaByCorreo = async (correo) => {
  const { rows } = await pool.query('SELECT * FROM personas WHERE correo = $1', [correo]);
  return rows[0];
};

// Desactivar extra
export const setPersonaActiva = async (personaId, activo, mustRoleId = null) => {
  if (mustRoleId) {
    const { rows } = await pool.query(`UPDATE personas SET activo=$2 WHERE id=$1 AND rol_id=$3 RETURNING id, correo, activo, rol_id`, [personaId, activo, mustRoleId]);
    return rows[0];
  }
  const { rows } = await pool.query(`UPDATE personas SET activo=$2 WHERE id=$1 RETURNING id, correo, activo, rol_id`, [personaId, activo]);
  return rows[0];
};

export default { getAllPersonas, getPersonaById, createPersona, updatePersona, deletePersona, getPersonaByCorreo, setPersonaActiva };


// ======== Personas extras (roles) ========

export const getClientePerfil = async (id) => {
  const { rows } = await pool.query(`SELECT id, correo, nombre, ap_paterno, ap_materno, rut, telefono, activo, rol_id FROM personas WHERE id = $1 AND rol_id = 2`, [id]);
  return rows[0];
};

export const updateClientePerfil = async (id, { nombre, ap_paterno, ap_materno, rut, telefono, passwordHashed = null }) => {
  if (passwordHashed) {
    const { rows } = await pool.query(
      `UPDATE personas SET nombre=$2, ap_paterno=$3, ap_materno=$4, rut=$5, telefono=$6, password=$7 WHERE id=$1 AND rol_id=2 RETURNING id, correo, nombre, ap_paterno, ap_materno, rut, telefono, activo, rol_id`, 
      [id, nombre, ap_paterno, ap_materno, rut, telefono, passwordHashed]);
    return rows[0];
  }
  const { rows } = await pool.query(
    `UPDATE personas SET nombre=$2, ap_paterno=$3, ap_materno=$4, rut=$5, telefono=$6 WHERE id=$1 AND rol_id=2 RETURNING id, correo, nombre, ap_paterno, ap_materno, rut, telefono, activo, rol_id`, [id, nombre, ap_paterno, ap_materno, rut, telefono]);
  return rows[0];
};

export const getTrabajadorPerfil = async (id) => {
  const { rows } = await pool.query(`SELECT id, correo, nombre, ap_paterno, ap_materno, rut, telefono, activo, rol_id FROM personas WHERE id = $1 AND rol_id = 3`, [id]);
  return rows[0];
};

export const updateTrabajadorPerfil = async (id, { telefono, passwordHashed = null }) => {
  if (passwordHashed) {
    const { rows } = await pool.query(`UPDATE personas SET telefono=$2, password=$3 WHERE id=$1 AND rol_id=3 RETURNING id, correo, nombre, ap_paterno, ap_materno, rut, telefono, activo, rol_id`, [id, telefono, passwordHashed]);
    return rows[0];
  }
  const { rows } = await pool.query(`UPDATE personas SET telefono=$2 WHERE id=$1 AND rol_id=3 RETURNING id, correo, nombre, ap_paterno, ap_materno, rut, telefono, activo, rol_id`, [id, telefono]);
  return rows[0];
};

export const createTrabajador = async ({ correo, passwordHashed, nombre, ap_paterno, ap_materno, rut, telefono, activo = true }) => {
  const { rows } = await pool.query(
    `INSERT INTO personas (correo, password, nombre, ap_paterno, ap_materno, rut, telefono, activo, rol_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8, 3) RETURNING id, correo, nombre, ap_paterno, ap_materno, rut, telefono, activo, rol_id`,
     [correo, passwordHashed, nombre, ap_paterno, ap_materno, rut, telefono, activo]);
  return rows[0];
};

export const updateTrabajadorAdmin = async (id, { nombre, ap_paterno, ap_materno, rut, telefono, activo, passwordHashed = null }) => {
  if (passwordHashed) {
    const { rows } = await pool.query(
      `UPDATE personas SET nombre=$2, ap_paterno=$3, ap_materno=$4, rut=$5, telefono=$6, activo=$7, password=$8 WHERE id=$1 AND rol_id=3 RETURNING id, correo, nombre, ap_paterno, ap_materno, rut, telefono, activo, rol_id`,
      [id, nombre, ap_paterno, ap_materno, rut, telefono, activo, passwordHashed]);
    return rows[0];
  }
  const { rows } = await pool.query(
    `UPDATE personas SET nombre=$2, ap_paterno=$3, ap_materno=$4, rut=$5, telefono=$6, activo=$7 WHERE id=$1 AND rol_id=3 RETURNING id, correo, nombre, ap_paterno, ap_materno, rut, telefono, activo, rol_id`,
    [id, nombre, ap_paterno, ap_materno, rut, telefono, activo]);
  return rows[0];
};
