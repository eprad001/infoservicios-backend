export const ROLES = {
  ADMIN: 1,
  CLIENTE: 2,
  TRABAJADOR: 3,
};

// Allow only specific roles
export const authorize = (...allowedRoles) => (req, res, next) => {
  try {
    const role = req.user?.rol_id;
    if (!role) return res.status(401).json({ message: 'No autenticado' });
    if (!allowedRoles.length || allowedRoles.includes(role)) return next();
    return res.status(403).json({ message: 'Acceso denegado' });
  } catch (e) {
    return res.status(401).json({ message: 'No autenticado' });
  }
};

// Allow SELF (by route param) OR specific roles
export const selfOrRoles = (idParam = 'id', ...allowedRoles) => (req, res, next) => {
  try {
    const role = req.user?.rol_id;
    const uid = req.user?.id;
    const paramId = Number(req.params[idParam]);
    if (!role || !uid) return res.status(401).json({ message: 'No autenticado' });
    if (uid === paramId) return next();
    if (allowedRoles.includes(role)) return next();
    return res.status(403).json({ message: 'Acceso denegado' });
  } catch (e) {
    return res.status(401).json({ message: 'No autenticado' });
  }
};
