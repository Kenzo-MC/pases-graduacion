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

module.exports = router;