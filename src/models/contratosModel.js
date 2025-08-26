// CRUD para contrato + consulta con joins

import pool from '../../db/config.js';
import { getServiciosByIds } from './serviciosModel.js';

const getAllContratos = async () => {
  const { rows } = await pool.query('SELECT * FROM contratos ORDER BY id ASC');
  return rows;
};

const getContratoById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM contratos WHERE id = $1', [id]);
  return rows[0];
};

const createContrato = async ({ cliente_id, trabajador_id, servicio_id, cantidad, total, contratado, finalizado, valoracion }) => {
  const { rows } = await pool.query(
    `INSERT INTO contratos (cliente_id, trabajador_id, servicio_id, cantidad, total, contratado, finalizado, valoracion) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [cliente_id, trabajador_id, servicio_id, cantidad, total, contratado, finalizado, valoracion]
  );
  return rows[0];
};

const updateContrato = async (id, { cliente_id, trabajador_id, servicio_id, cantidad, total, contratado, finalizado, valoracion }) => {
  const { rows } = await pool.query(
    `UPDATE contratos SET cliente_id=$1, trabajador_id=$2, servicio_id=$3, cantidad=$4, total=$5, contratado=$6, finalizado=$7, valoracion=$8 WHERE id=$9 RETURNING *`,
    [cliente_id, trabajador_id, servicio_id, cantidad, total, contratado, finalizado, valoracion, id]
  );
  return rows[0];
};

const deleteContrato = async (id) => {
  await pool.query('DELETE FROM contratos WHERE id = $1', [id]);
  return { message: 'Contrato eliminado' };
};

// ======== Vista de contrato + cliente + trabajador + servicio ======= version inicial acotada a 1 es a 1
const getContratosFull = async () => {
  const { rows } = await pool.query(`
    SELECT ct.*,
      cli.nombre AS cliente_nombre,
      cli.ap_paterno AS cliente_ap_paterno,
      tra.nombre AS trabajador_nombre,
      tra.ap_paterno AS trabajador_ap_paterno,
      s.titulo  AS servicio_titulo,
      s.precio  AS servicio_precio,
      s.categoria_id,
      c.nombre  AS categoria_nombre
    FROM contratos ct
    LEFT JOIN personas cli ON cli.id = ct.cliente_id
    LEFT JOIN personas tra ON tra.id = ct.trabajador_id
    LEFT JOIN servicios s ON s.id = ct.servicio_id
    LEFT JOIN categorias c ON c.id = s.categoria_id
    ORDER BY ct.id ASC;
  `);
  return rows;
};

export default { getAllContratos, getContratoById, createContrato, updateContrato, deleteContrato, getContratosFull };

// ========== Contratos: carrito + detalle + valoración ==========

export const getContratosCliente = async (clienteId) => {
  const { rows } = await pool.query(`SELECT ct.id, ct.cliente_id, ct.trabajador_id, ct.total, ct.creado_en FROM contratos ct WHERE ct.cliente_id = $1 ORDER BY ct.id DESC`, [clienteId]);
  return rows;
};

export const getSolicitudesDelTrabajador = async (trabajadorId) => {
  const { rows } = await pool.query(`SELECT ct.id, ct.cliente_id, ct.trabajador_id, ct.total, ct.creado_en FROM contratos ct WHERE ct.trabajador_id = $1 ORDER BY ct.id DESC`, [trabajadorId]);
  return rows;
};

export const crearContratosDesdeCarrito = async (clienteId, items /* [{servicio_id, cantidad}] */) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const cantidades = new Map();
    for (const it of items) {
      const sid = Number(it.servicio_id);
      const qty = Number(it.cantidad || 1);
      if (!Number.isFinite(sid) || !Number.isFinite(qty) || qty <= 0) throw new Error('Item inválido');
      cantidades.set(sid, (cantidades.get(sid) || 0) + qty);
    }
    const servicioIds = [...cantidades.keys()];
    const servicios = await getServiciosByIds(servicioIds);
    if (servicios.length !== servicioIds.length) throw new Error('Uno o más servicios no existen');
    for (const s of servicios) if (!s.activo) throw new Error(`Servicio ${s.id} no está activo`);
    const porTrabajador = new Map();
    for (const s of servicios) {
      const qty = cantidades.get(s.id);
      if (!porTrabajador.has(s.trabajador_id)) porTrabajador.set(s.trabajador_id, []);
      porTrabajador.get(s.trabajador_id).push({ servicio: s, cantidad: qty });
    }
    const creados = [];
    for (const [trabajadorId, lista] of porTrabajador.entries()) {
      const { rows: cRows } = await client.query(`INSERT INTO contratos (cliente_id, trabajador_id, total) VALUES ($1, $2, 0) RETURNING id, cliente_id, trabajador_id, total, creado_en`, [clienteId, trabajadorId]);
      const contrato = cRows[0];
      let total = 0;
      for (const { servicio, cantidad } of lista) {
        const precio = Number(servicio.precio);
        total += cantidad * precio;
        await client.query(`INSERT INTO contrato_items (contrato_id, servicio_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)`, [contrato.id, servicio.id, cantidad, precio]);
      }
      const { rows: upd } = await client.query(`UPDATE contratos SET total=$2 WHERE id=$1 RETURNING id, cliente_id, trabajador_id, total, creado_en`, [contrato.id, total]);
      const { rows: itemsRows } = await client.query(`SELECT ci.id, ci.servicio_id, ci.cantidad, ci.precio_unitario, ci.valoracion, s.titulo AS servicio_titulo FROM contrato_items ci JOIN servicios s ON s.id = ci.servicio_id WHERE ci.contrato_id = $1 ORDER BY ci.id ASC`, [contrato.id]);
      creados.push({ ...upd[0], items: itemsRows });
    }
    await client.query('COMMIT');
    return creados;
  } catch (e) { 
    await client.query('ROLLBACK'); throw e; 
  } finally { 
    client.release(); 
  }
};

export const getContratoDetalle = async (contratoId) => {
  const { rows: header } = await pool.query(`SELECT c.*, p.nombre AS cliente_nombre, t.nombre AS trabajador_nombre FROM contratos c JOIN personas p ON p.id = c.cliente_id JOIN personas t ON t.id = c.trabajador_id WHERE c.id = $1`, [contratoId]);
  if (!header[0]) return null;
  const { rows: items } = await pool.query(`SELECT ci.*, s.titulo AS servicio_titulo FROM contrato_items ci JOIN servicios s ON s.id = ci.servicio_id WHERE ci.contrato_id = $1 ORDER BY ci.id ASC`, [contratoId]);
  return { ...header[0], items };
};

export const valorarItem = async (clienteId, contratoId, itemId, puntos) => {
  const { rows: own } = await pool.query(`SELECT 1 FROM contratos WHERE id=$1 AND cliente_id=$2`, [contratoId, clienteId]);
  if (!own[0]) return null;
  const { rows } = await pool.query(`UPDATE contrato_items SET valoracion = COALESCE(valoracion, 0) + $4 WHERE id = $3 AND contrato_id = $1 RETURNING *`,[contratoId, clienteId, itemId, puntos]);
  return rows[0];
};
