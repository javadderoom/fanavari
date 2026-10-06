-- DropIndex
DROP INDEX "ProcessAccessGrant_processId_userId_key";

-- AlterTable
ALTER TABLE "ProcessAccessGrant" ADD COLUMN     "claimExpiresAt" TIMESTAMP(3),
ADD COLUMN     "claimToken" TEXT,
ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "roleName" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "departmentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ProcessAccessGrant_claimToken_key" ON "ProcessAccessGrant"("claimToken");

-- CreateIndex
CREATE INDEX "ProcessAccessGrant_processId_idx" ON "ProcessAccessGrant"("processId");

-- CreateIndex
CREATE INDEX "ProcessAccessGrant_userId_idx" ON "ProcessAccessGrant"("userId");

-- CreateIndex
CREATE INDEX "ProcessAccessGrant_departmentId_idx" ON "ProcessAccessGrant"("departmentId");

-- CreateIndex
CREATE INDEX "ProcessAccessGrant_roleName_idx" ON "ProcessAccessGrant"("roleName");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessAccessGrant" ADD CONSTRAINT "ProcessAccessGrant_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
