const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
  const { correo, password } = req.body;
  const user = await prisma.usuario.findUnique({ where: { correo } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  const token = jwt.sign({ userId: user.id, rol: user.rol }, 'clave_super_secreta_2025', { expiresIn: '8h' });
  res.json({ token, rol: user.rol, nombre: user.nombre });
});

module.exports = router;