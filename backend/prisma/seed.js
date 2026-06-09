const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('admin123', 10);
  await prisma.usuario.upsert({
    where: { correo: 'admin@test.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      correo: 'admin@test.com',
      password: hashed,
      rol: 'admin'
    }
  });
  console.log('Usuario admin creado');
}
main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());