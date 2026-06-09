-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ActoGraduacion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "hora" TEXT NOT NULL,
    "lugar" TEXT NOT NULL,
    "aforoMaximo" INTEGER NOT NULL,
    "invitadosPorGraduando" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Graduando" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cedula" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "actoId" INTEGER NOT NULL,
    CONSTRAINT "Graduando_actoId_fkey" FOREIGN KEY ("actoId") REFERENCES "ActoGraduacion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigoQR" TEXT NOT NULL,
    "graduandoId" INTEGER NOT NULL,
    "numeroInvitado" INTEGER NOT NULL,
    "nombreInvitado" TEXT,
    "utilizado" BOOLEAN NOT NULL DEFAULT false,
    "fechaUso" DATETIME,
    "puerta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pase_graduandoId_fkey" FOREIGN KEY ("graduandoId") REFERENCES "Graduando" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Graduando_cedula_key" ON "Graduando"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "Pase_codigoQR_key" ON "Pase"("codigoQR");
