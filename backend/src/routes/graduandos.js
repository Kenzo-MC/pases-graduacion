const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const auth = require('../middlewares/auth');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB máximo
});
router.post('/upload/:actoId', auth, upload.single('file'), async (req, res) => {
  if (!req.file) {
  return res.status(400).json({ error: 'Archivo no proporcionado o demasiado grande (máx. 5 MB).' });
}
  if (req.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo el administrador puede cargar graduandos' });
  }
  const { actoId } = req.params;
  const results = [];
  const erroresLectura = [];
  let linea = 0;

  // Leer el archivo CSV
  fs.createReadStream(req.file.path)
    .pipe(csv({ mapHeaders: ({ header }) => header.toLowerCase() }))
    .on('data', (row) => {
      linea++;
      if (!row.cedula || !row.nombre || !row.correo) {
        erroresLectura.push(`Línea ${linea}: faltan campos obligatorios`);
        return;
      }
      results.push({
        cedula: row.cedula.trim(),
        nombre: row.nombre.trim(),
        apellido: (row.apellido || '').trim(),
        carrera: (row.carrera || '').trim(),
        correo: row.correo.trim(),
        actoId: parseInt(actoId)
      });
    })
    .on('end', async () => {
      fs.unlinkSync(req.file.path); // eliminar archivo temporal

      if (results.length === 0) {
        return res.json({
          message: `No se encontraron registros válidos. ${erroresLectura.length} líneas con error de formato.`,
          errores: erroresLectura.slice(0, 10)
        });
      }

      // Insertar uno a uno para detectar duplicados
      let insertados = 0;
      const erroresInsercion = [];

      for (const g of results) {
        try {
          await prisma.graduando.create({ data: g });
          insertados++;
        } catch (error) {
          if (error.code === 'P2002') { // violación de unicidad (cédula duplicada)
            erroresInsercion.push(`Cédula duplicada: ${g.cedula}`);
          } else {
            erroresInsercion.push(`Error en ${g.cedula}: ${error.message}`);
          }
        }
      }

      res.json({
        message: `${insertados} graduandos cargados correctamente. ${erroresLectura.length + erroresInsercion.length} errores.`,
        insertados,
        erroresLectura: erroresLectura.slice(0, 10),
        erroresInsercion: erroresInsercion.slice(0, 20)
      });
    })
    .on('error', (error) => {
      console.error(error);
      res.status(500).json({ error: 'Error al leer el archivo CSV. Verifica el formato.' });
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