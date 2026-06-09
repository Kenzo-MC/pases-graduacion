const express = require('express');
const auth = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.use(auth);

router.get('/', async (_, res) => {
  const actos = await prisma.actoGraduacion.findMany({ orderBy: { fecha: 'desc' } });
  res.json(actos);
});

router.post('/', async (req, res) => {
  const { nombre, fecha, hora, lugar, aforoMaximo, invitadosPorGraduando } = req.body;
  const acto = await prisma.actoGraduacion.create({
    data: {
      nombre,
      fecha: new Date(fecha),
      hora,
      lugar,
      aforoMaximo: Number(aforoMaximo),
      invitadosPorGraduando: Number(invitadosPorGraduando)
    }
  });
  res.status(201).json(acto);
});

module.exports = router;