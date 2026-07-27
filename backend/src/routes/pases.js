const express = require('express');
const auth = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');
const router = express.Router();
const prisma = new PrismaClient();
// Ruta pública: cualquier persona con el código QR puede ver su pase digital
router.get('/publico/:codigoQR', async (req, res) => {
  const pase = await prisma.pase.findUnique({
    where: { codigoQR: req.params.codigoQR },
    include: { graduando: { include: { acto: true } } }
  });

  if (!pase) return res.status(404).json({ error: 'Pase no encontrado' });
  if (pase.utilizado) return res.status(410).json({ error: 'Este pase ya fue utilizado' });

  res.json({
    id: pase.id,
    codigoQR: pase.codigoQR,
    graduando: pase.graduando.nombre,
    numeroInvitado: pase.numeroInvitado,
    nombreInvitado: pase.nombreInvitado,
    acto: {
      nombre: pase.graduando.acto.nombre,
      fecha: pase.graduando.acto.fecha,
      hora: pase.graduando.acto.hora,
      lugar: pase.graduando.acto.lugar
    }
  });
});
router.post('/generar/:actoId', auth, async (req, res) => {
  const { actoId } = req.params;
  const acto = await prisma.actoGraduacion.findUnique({ where: { id: parseInt(actoId) } });
  if (!acto) return res.status(404).json({ error: 'Acto no encontrado' });

  const graduandos = await prisma.graduando.findMany({ where: { actoId: parseInt(actoId) } });
  let total = 0;
  for (const g of graduandos) {
    for (let i = 1; i <= acto.invitadosPorGraduando; i++) {
      await prisma.pase.create({
        data: {
          codigoQR: randomUUID(),
          graduandoId: g.id,
          numeroInvitado: i
        }
      });
      total++;
    }
  }
  res.json({ message: `${total} pases generados` });
});
// Obtener todos los pases de un acto
router.get('/acto/:actoId', auth, async (req, res) => {
  const pases = await prisma.pase.findMany({
    where: { graduando: { actoId: parseInt(req.params.actoId) } },
    include: { graduando: true }
  });
  res.json(pases);
});

// Obtener imagen QR de un pase específico
const QRCode = require('qrcode');
router.get('/:id/qr', async (req, res) => {
  const pase = await prisma.pase.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!pase) return res.status(404).json({ error: 'Pase no encontrado' });

  try {
    const qrImage = await QRCode.toBuffer(pase.codigoQR, { width: 300, margin: 2 });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.send(qrImage);
  } catch (err) {
    res.status(500).json({ error: 'Error al generar QR' });
  }
});
// Actualizar datos de un pase (ej. nombre del invitado)
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { nombreInvitado } = req.body;

  try {
    const paseActualizado = await prisma.pase.update({
      where: { id: parseInt(id) },
      data: { nombreInvitado }
    });
    res.json(paseActualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el pase' });
  }
});

// Eliminar un pase
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.pase.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Pase eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el pase' });
  }
});
module.exports = router;