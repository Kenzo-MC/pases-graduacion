const express = require('express');
const bcrypt = require('bcryptjs');
const auth = require('../middlewares/auth');
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
// Listar usuarios (solo admin)
router.get('/usuarios', auth, async (req, res) => {
  if (req.rol !== 'admin') return res.status(403).json({ error: 'Solo administrador' });
  const usuarios = await prisma.usuario.findMany({
    select: { id: true, nombre: true, correo: true, rol: true, createdAt: true }
  });
  res.json(usuarios);
});

// Registrar nuevo usuario (solo admin)
router.post('/register', auth, async (req, res) => {
  if (req.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo el administrador puede crear usuarios' });
  }
  const { nombre, correo, password, rol } = req.body;
  if (!nombre || !correo || !password || !rol) {
    return res.status(400).json({ error: 'Faltan campos' });
  }
  const existe = await prisma.usuario.findUnique({ where: { correo } });
  if (existe) return res.status(400).json({ error: 'El correo ya existe' });

  const hashed = await bcrypt.hash(password, 10);
  const usuario = await prisma.usuario.create({
    data: { nombre, correo, password: hashed, rol }
  });
  res.status(201).json({ id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol });
});
module.exports = router;