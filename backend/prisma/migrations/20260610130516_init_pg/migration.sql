-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActoGraduacion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "hora" TEXT NOT NULL,
    "lugar" TEXT NOT NULL,
    "aforoMaximo" INTEGER NOT NULL,
    "invitadosPorGraduando" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActoGraduacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Graduando" (
    "id" SERIAL NOT NULL,
    "cedula" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "actoId" INTEGER NOT NULL,

    CONSTRAINT "Graduando_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pase" (
    "id" SERIAL NOT NULL,
    "codigoQR" TEXT NOT NULL,
    "graduandoId" INTEGER NOT NULL,
    "numeroInvitado" INTEGER NOT NULL,
    "nombreInvitado" TEXT,
    "utilizado" BOOLEAN NOT NULL DEFAULT false,
    "fechaUso" TIMESTAMP(3),
    "puerta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Graduando_cedula_key" ON "Graduando"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "Pase_codigoQR_key" ON "Pase"("codigoQR");

-- AddForeignKey
ALTER TABLE "Graduando" ADD CONSTRAINT "Graduando_actoId_fkey" FOREIGN KEY ("actoId") REFERENCES "ActoGraduacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pase" ADD CONSTRAINT "Pase_graduandoId_fkey" FOREIGN KEY ("graduandoId") REFERENCES "Graduando"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
