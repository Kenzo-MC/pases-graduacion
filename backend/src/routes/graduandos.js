const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const auth = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

router.post('/upload/:actoId', auth, upload.single('file'), async (req, res) => {
  const { actoId } = req.params;
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      const graduandos = [];
      for (const row of results) {
        if (row.cedula && row.nombre && row.correo) {
          graduandos.push({
            cedula: row.cedula.trim(),
            nombre: row.nombre.trim(),
            correo: row.correo.trim(),
            actoId: parseInt(actoId)
          });
        }
      }
      await prisma.graduando.createMany({ data: graduandos });
      fs.unlinkSync(req.file.path);
      res.json({ message: `${graduandos.length} graduandos cargados` });
    });
});
// Obtener todos los graduandos de un acto
router.get('/acto/:actoId', auth, async (req, res) => {
  const graduandos = await prisma.graduando.findMany({
    where: { actoId: parseInt(req.params.actoId) }
  });
  res.json(graduandos);
});

// Crear un graduando manualmente
router.post('/', auth, async (req, res) => {
  const { cedula, nombre, apellido, carrera, correo, actoId } = req.body;
  try {
    const graduando = await prisma.graduando.create({
      data: {
        cedula: cedula.trim(),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        carrera: carrera.trim(),
        correo: correo.trim(),
        actoId: parseInt(actoId)
      }
    });
    res.status(201).json(graduando);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear graduando. La cédula podría estar duplicada.' });
  }
});

// Editar un graduando
router.put('/:id', auth, async (req, res) => {if (req.rol !== 'admin') {
  return res.status(403).json({ error: 'Solo el administrador puede gestionar graduandos' });
}
  const { id } = req.params;
  const { cedula, nombre, apellido, carrera, correo } = req.body;
  try {
    const graduando = await prisma.graduando.update({
      where: { id: parseInt(id) },
      data: { cedula, nombre, apellido, carrera, correo }
    });
    res.json(graduando);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar graduando' });
  }
});

// Eliminar un graduando
router.delete('/:id', auth, async (req, res) => {if (req.rol !== 'admin') {
  return res.status(403).json({ error: 'Solo el administrador puede gestionar graduandos' });
}
  const { id } = req.params;
  try {
    // Si hay pases asociados, eliminarlos primero (opcional)
    await prisma.pase.deleteMany({ where: { graduandoId: parseInt(id) } });
    await prisma.graduando.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Graduando eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar graduando' });
  }
});
module.exports = router;