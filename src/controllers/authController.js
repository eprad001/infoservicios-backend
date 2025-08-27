import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import personas from '../models/personasModel.js';

const sanitize = (p) => {
  if (!p) return p;
  const { password, ...safe } = p;
  return safe;
};

const signToken = (persona) => {
  const payload = { id: persona.id, correo: persona.correo, rol_id: persona.rol_id };
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET no está definido en el backend (.env)');
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
};

// ========== Validadores =========
const validarEmail = (correo = '') =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(correo).trim());

const validarRutChilenoEstricto = (rut = '') => {
  const s = String(rut).trim();
  if (!/^\d{7,8}-[0-9Kk]$/.test(s)) return false;

  const [cuerpo, dvIngresado] = s.split('-');
  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = 11 - (suma % 11);
  const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return dvEsperado === dvIngresado.toUpperCase();
};

const register = async (req, res) => {
  try {
    let {
      correo,
      password,
      nombre,
      ap_paterno,
      ap_materno,
      rut,
      telefono,
      activo = true,
      rol_id = 2 // 2 = Cliente por defecto
    } = req.body;

    const correoNorm = String(correo || '').trim().toLowerCase();
    const rutIngresado = String(rut || '').trim();

    if (!correoNorm || !password || !String(nombre || '').trim() || !String(ap_paterno || '').trim() || !String(ap_materno || '').trim() || !rutIngresado || !telefono) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    if (!validarEmail(correoNorm)) {
      return res.status(400).json({ message: 'Correo electrónico no válido' });
    }

    if (!validarRutChilenoEstricto(rutIngresado)) {
      return res.status(400).json({
        message: 'RUT inválido. Por favor ingresar SIN puntos y CON guion (ejemplo: 12345678-5)'
      });
    }

    // Unicidad por correo (case-insensitive)
    const existe = await personas.getPersonaByCorreo(correoNorm);
    if (existe) {
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const nueva = await personas.createPersona({
      correo: correoNorm,
      password: hashed,
      nombre: String(nombre).trim(),
      ap_paterno: String(ap_paterno).trim(),
      ap_materno: String(ap_materno).trim(),
      rut: rutIngresado,
      telefono,
      activo,
      rol_id
    });

    const token = signToken(nueva);
    return res.status(201).json({ token, user: sanitize(nueva) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { correo, password } = req.body;
    if (!correo || !password) {
      return res.status(400).json({ message: 'Correo y password son obligatorios' });
    }
    const persona = await personas.getPersonaByCorreo(correo);
    if (!persona) return res.status(401).json({ message: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, persona.password || '');
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

    const token = signToken(persona);
    return res.json({ token, user: sanitize(persona) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

const me = async (req, res) => {
  try {
    const id = req.user?.id;
    if (!id) return res.status(401).json({ message: 'No autorizado' });
    // x getPersonaById o buscamos por correo
    const getById = personas.getPersonaById ? personas.getPersonaById : null;
    let persona = null;
    if (getById) {
      persona = await personas.getPersonaById(id);
    } else if (req.user?.correo) {
      persona = await personas.getPersonaByCorreo(req.user.correo);
    }
    if (!persona) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.json({ user: sanitize(persona) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export default { register, login, me };
