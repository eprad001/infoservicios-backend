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




// ========== Contratos: carrito + detalle + valoración ==========

export const getContratosCliente = async (clienteId) => {
  const { rows } = await pool.query(`SELECT ct.id, ct.cliente_id, ct.total, ct.finalizado FROM contratos ct WHERE ct.cliente_id = $1 ORDER BY ct.id DESC`, [clienteId]);
  return rows;
};

export const getContratoDetalle = async (contratoId) => {
  const { rows: header } = await pool.query(`SELECT c.*, p.nombre AS cliente_nombre, t.nombre AS trabajador_nombre FROM contratos c JOIN personas p ON p.id = c.cliente_id JOIN personas t ON t.id = c.trabajador_id WHERE c.id = $1`, [contratoId]);
  if (!header[0]) return null;
  const { rows: items } = await pool.query(`SELECT ci.*, s.titulo AS servicio_titulo FROM contrato_items ci JOIN servicios s ON s.id = ci.servicio_id WHERE ci.contrato_id = $1 ORDER BY ci.id ASC`, [contratoId]);
  return { ...header[0], items };
};

export const getSolicitudesDelTrabajador = async (trabajadorId) => {
  const { rows } = await pool.query(`SELECT ct.id, ct.cliente_id, ct.trabajador_id, ct.total, ct.creado_en FROM contratos ct WHERE ct.trabajador_id = $1 ORDER BY ct.id DESC`, [trabajadorId]);
  return rows;
};

// ======================================================================================================



export async function crearContratoDesdeCart(clienteId, cart, totalFromBody) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: cRows } = await client.query(
      `INSERT INTO contratos (cliente_id, total, finalizado) VALUES ($1, $2, FALSE) RETURNING id, cliente_id, total, finalizado`, [clienteId, totalFromBody] );
    const contrato = cRows[0];

    if (Array.isArray(cart) && cart.length > 0) {
      const values = [];
      const ph = [];
      let k = 1;
      for (const it of cart) {
        values.push(contrato.id, it.id, it.count, it.precio);
        ph.push(`($${k}, $${k+1}, $${k+2}, $${k+3})`);
        k += 4;
      }
      await client.query(
        `INSERT INTO contrato_items (contrato_id, servicio_id, cantidad, precio_unitario) VALUES ${ph.join(',')}`, values );
    }
    await client.query('COMMIT');
    return {
      ok: true,
      contrato: {
        id: contrato.id,
        cliente_id: contrato.cliente_id,
        total: Number(contrato.total),
        finalizado: contrato.finalizado,
        items: Array.isArray(cart) ? cart.map((it) => ({
          servicio_id: it.id,
          cantidad: it.count,
          precio_unitario: it.precio,
          titulo: it.titulo,
          descripcion: it.descripcion,
          subtotal: (typeof it.precio === 'number' && typeof it.count === 'number')
                    ? it.precio * it.count
                    : null
        })) : []
      }
    };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally { client.release(); }
}


//Valoracion = NOT valoracion sobre el item de ese contrato y servicio.
// likes_servicio_total = COUNT(*) de contrato_items con valoracion=true para ese servicio **/

export async function toggleLikeServicioDeContrato(clienteId, contratoId, servicioId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1) Verificar que el contrato pertenezca al cliente
    const { rows: own } = await client.query( `SELECT 1 FROM contratos WHERE id = $1 AND cliente_id = $2`, [contratoId, clienteId] );
    if (!own[0]) {
      await client.query('ROLLBACK');
      return { error: 'Contrato no encontrado o no pertenece al cliente', status: 404 };
    }

    // 2) Localizar el item (único por contrato+servicio)
    const { rows: itemRows } = await client.query( `SELECT id, valoracion FROM contrato_items WHERE contrato_id = $1 AND servicio_id = $2 LIMIT 1 FOR UPDATE`, [contratoId, servicioId] );
    if (!itemRows[0]) {
      await client.query('ROLLBACK');
      return { error: 'Servicio no pertenece a este contrato', status: 404 };
    }
    const itemId = itemRows[0].id;

    // 3) Toggle: NOT valoracion
    const { rows: upd } = await client.query( `UPDATE contrato_items SET valoracion = NOT valoracion WHERE id = $1 RETURNING valoracion`, [itemId] );
    const liked = !!upd[0].valoracion;

    // 4) Total por servicio (valoracion = true)
    const { rows: tot } = await client.query( `SELECT COUNT(*)::int AS total FROM contrato_items WHERE servicio_id = $1 AND valoracion = TRUE`, [servicioId] );

    await client.query('COMMIT');
    return {
      liked,
      likes_item: liked ? 1 : 0,
      likes_servicio_total: Number(tot[0].total),
      item_id: itemId,
      status: 200
    };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

/** Contadores (item + total servicio) */
export async function getLikesItem(contratoId, servicioId) {
  const { rows: it } = await pool.query(
    `SELECT id, valoracion FROM contrato_items WHERE contrato_id = $1 AND servicio_id = $2 LIMIT 1`, [contratoId, servicioId] );
  if (!it[0]) return { error: 'Servicio no pertenece a este contrato', status: 404 };
  const itemId = it[0].id;
  const likes_item = it[0].valoracion ? 1 : 0;

  const { rows: tot } = await pool.query( `SELECT COUNT(*)::int AS total FROM contrato_items WHERE servicio_id = $1 AND valoracion = TRUE`, [servicioId] );
  return { item_id: itemId, likes_item, likes_servicio_total: Number(tot[0].total), status: 200 };
}

export async function getLikesServicioTotal(servicioId) {
  const { rows } = await pool.query( `SELECT COUNT(*)::int AS total FROM contrato_items WHERE servicio_id = $1 AND valoracion = TRUE`, [servicioId] );
  return { likes_servicio_total: Number(rows[0].total), status: 200 };
}

export default { getAllContratos, getContratoById, createContrato, updateContrato, deleteContrato };