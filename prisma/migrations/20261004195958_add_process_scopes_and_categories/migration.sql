-- CreateTable
CREATE TABLE "ProcessScope" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessScope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessCategory" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "scopeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProcessScope_key_key" ON "ProcessScope"("key");

-- AddForeignKey
ALTER TABLE "ProcessCategory" ADD CONSTRAINT "ProcessCategory_scopeId_fkey" FOREIGN KEY ("scopeId") REFERENCES "ProcessScope"("id") ON DELETE CASCADE ON UPDATE CASCADE;
