const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { codigoQR, puerta } = req.body;
  const pase = await prisma.pase.findUnique({
    where: { codigoQR },
    include: { graduando: { include: { acto: true } } }
  });
  if (!pase) return res.json({ valido: false, mensaje: 'Pase no encontrado' });
  if (pase.utilizado) return res.json({ valido: false, mensaje: 'Pase ya utilizado' });

  const acto = pase.graduando.acto;
  const hoy = new Date();
  const fechaActo = new Date(acto.fecha);
  if (hoy.toDateString() !== fechaActo.toDateString()) {
    return res.json({ valido: false, mensaje: 'El evento no es hoy' });
  }

  const usados = await prisma.pase.count({
    where: { graduando: { actoId: acto.id }, utilizado: true }
  });
  if (usados >= acto.aforoMaximo) {
    return res.json({ valido: false, mensaje: 'Aforo completo' });
  }

  await prisma.pase.update({
    where: { id: pase.id },
    data: { utilizado: true, fechaUso: new Date(), puerta: puerta || 'Principal' }
  });

  res.json({ valido: true, mensaje: 'Acceso permitido', graduando: pase.graduando.nombre, invitado: pase.numeroInvitado });
});

module.exports = router;