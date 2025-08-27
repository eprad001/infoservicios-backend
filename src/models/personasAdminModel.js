import pool from '../../db/config.js';
import bcrypt from 'bcryptjs';

export async function assertEsTrabajador(trabajador_id) {
  const { rows } = await pool.query(
    `SELECT id FROM personas WHERE id = $1 AND rol_id = 3`, [trabajador_id] );
  return !!rows[0];
}

export async function crearTrabajadorPersona({
  correo,
  password,
  nombre,
  ap_paterno,
  ap_materno,
  rut,
  telefono,
  activo = true,
  rol_id = 3,
}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const exists = await client.query(`SELECT id FROM personas WHERE correo = $1 LIMIT 1`, [correo]);
    if (exists.rows[0]) {
      await client.query('ROLLBACK');
      const err = new Error('El correo ya está registrado');
      err.status = 409;
      throw err;
    }

    const hashed = await bcrypt.hash(password, 10);
    const { rows } = await client.query(
      `INSERT INTO personas (correo, password, nombre, ap_paterno, ap_materno, rut, telefono, activo, rol_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, correo, nombre, ap_paterno, ap_materno, rut, telefono, activo, rol_id`,
      [correo, hashed, nombre, ap_paterno, ap_materno, rut, telefono, activo, rol_id]
    );

    await client.query('COMMIT');
    return rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function crearServicioParaTrabajador(trabajador_id, { titulo, descripcion = null, precio = 0, foto = null }) {
  const { rows } = await pool.query(
    `INSERT INTO servicios (titulo, descripcion, precio, foto, trabajador_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, titulo, descripcion, precio, foto, trabajador_id`, [titulo, descripcion, precio, foto, trabajador_id] );
  return rows[0];
}

export async function asignarServicioATrabajador(servicio_id, trabajador_id) {
  const { rows } = await pool.query(
    `UPDATE servicios SET trabajador_id = $2 WHERE id = $1 RETURNING id, titulo, descripcion, precio, foto, trabajador_id`, [servicio_id, trabajador_id] );
  return rows[0] || null;
}

export async function listarTrabajadoresConServicios({ q = null, activo = null } = {}) {
  const where = ['p.rol_id = 3'];
  const params = [];
  let i = 1;
  if (q && String(q).trim() !== '') {
    params.push(`%${String(q).trim()}%`);
    where.push(`(p.nombre ILIKE $${i} OR p.ap_paterno ILIKE $${i} OR p.ap_materno ILIKE $${i} OR p.correo ILIKE $${i})`);
    i += 1;
  }
  if (typeof activo === 'boolean') {
    params.push(activo);
    where.push(`p.activo = $${i}`);
    i += 1;
  }
  const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT
       p.id, p.correo, p.nombre, p.ap_paterno, p.ap_materno, p.rut, p.telefono, p.activo, p.rol_id,
       COALESCE(
         json_agg(
           json_build_object('id', s.id, 'titulo', s.titulo, 'descripcion', s.descripcion, 'precio', s.precio, 'foto', s.foto)
           ORDER BY s.id
         ) FILTER (WHERE s.id IS NOT NULL),
         '[]'
       ) AS servicios
     FROM personas p
     LEFT JOIN servicios s ON s.trabajador_id = p.id
     ${whereSQL}
     GROUP BY p.id, p.correo, p.nombre, p.ap_paterno, p.ap_materno, p.rut, p.telefono, p.activo, p.rol_id
     ORDER BY p.id ASC`,
    params
  );
  return {
    ok: true,
    count: rows.length,
    results: rows.map(r => ({
      id: r.id,
      correo: r.correo,
      nombre: r.nombre,
      ap_paterno: r.ap_paterno,
      ap_materno: r.ap_materno,
      rut: r.rut,
      telefono: r.telefono,
      activo: r.activo,
      rol_id: r.rol_id,
      servicios: r.servicios || []
    }))
  };
}

export async function deshabilitarTrabajador(trabajador_id) {
  const { rows } = await pool.query(
    `UPDATE personas SET activo = FALSE WHERE id = $1 AND rol_id = 3 RETURNING id, correo, nombre, ap_paterno, ap_materno, rut, telefono, activo, rol_id`, [trabajador_id] );
  return rows[0] || null;
}

export async function listarClientes({ q = null, activo = null } = {}) {
  const where = ['p.rol_id = 2'];
  const params = [];
  let i = 1;

  if (q && String(q).trim() !== '') {
    params.push(`%${String(q).trim()}%`);
    where.push(`(p.nombre ILIKE $${i} OR p.ap_paterno ILIKE $${i} OR p.ap_materno ILIKE $${i} OR p.correo ILIKE $${i})`);
    i += 1;
  }
  if (typeof activo === 'boolean') {
    params.push(activo);
    where.push(`p.activo = $${i}`);
    i += 1;
  }
  const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT p.id, p.correo, p.nombre, p.ap_paterno, p.ap_materno, p.rut, p.telefono, p.activo, p.rol_id FROM personas p ${whereSQL} ORDER BY p.id ASC`, params );
  return { ok: true, count: rows.length, results: rows };
}

export async function deshabilitarCliente(cliente_id) {
  const { rows } = await pool.query(
    `UPDATE personas SET activo = FALSE WHERE id = $1 AND rol_id = 2 RETURNING id, correo, nombre, ap_paterno, ap_materno, rut, telefono, activo, rol_id`, [cliente_id] );
  return rows[0] || null;
}
