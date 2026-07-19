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

router.post('/', auth, async (req, res) => {
  const { nombre, fecha, hora, lugar, aforoMaximo, invitadosPorGraduando } = req.body;
  const acto = await prisma.actoGraduacion.create({
    data: {
      nombre,
      fecha,   
      hora,
      lugar,
      aforoMaximo: Number(aforoMaximo),
      invitadosPorGraduando: Number(invitadosPorGraduando)
    }
  });
  res.status(201).json(acto);
});
 
// Editar un acto
router.put('/:id', auth, async (req, res) => {if (req.rol !== 'admin') {
  return res.status(403).json({ error: 'Solo el administrador puede modificar actos' });
}
  const { id } = req.params;
  const { nombre, fecha, hora, lugar, aforoMaximo, invitadosPorGraduando } = req.body;
  try {
    const acto = await prisma.actoGraduacion.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        fecha,   
        hora,
        lugar,
        aforoMaximo: Number(aforoMaximo),
        invitadosPorGraduando: Number(invitadosPorGraduando)
      }
    });
    res.json(acto);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el acto' });
  }
});
router.delete('/:id', auth, async (req, res) => {if (req.rol !== 'admin') {
  return res.status(403).json({ error: 'Solo el administrador puede modificar actos' });
}
  const { id } = req.params;
  try {
    // 1. Eliminar pases de los graduandos del acto
    await prisma.pase.deleteMany({
      where: { graduando: { actoId: parseInt(id) } }
    });
    // 2. Eliminar graduandos del acto
    await prisma.graduando.deleteMany({
      where: { actoId: parseInt(id) }
    });
    // 3. Eliminar el acto
    await prisma.actoGraduacion.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Acto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el acto' });
  }
});
module.exports = router;