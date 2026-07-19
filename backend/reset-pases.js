const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const actoId = 1; // Cambia por el ID del acto
  await prisma.pase.updateMany({
    where: { graduando: { actoId } },
    data: { utilizado: false, fechaUso: null, puerta: null }
  });
  console.log('Pases reiniciados');
}
main().finally(() => prisma.$disconnect());