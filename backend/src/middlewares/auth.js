const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token requerido' });
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'clave_super_secreta_2025');
    req.userId = decoded.userId;
    req.rol = decoded.rol;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};