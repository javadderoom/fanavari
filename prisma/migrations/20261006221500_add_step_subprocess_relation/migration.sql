-- AlterTable
ALTER TABLE "Step" ADD COLUMN "subProcessId" TEXT,
ADD COLUMN "subProcessSlug" TEXT;

-- CreateIndex
CREATE INDEX "Step_subProcessId_idx" ON "Step"("subProcessId");

-- AddForeignKey
ALTER TABLE "Step" ADD CONSTRAINT "Step_subProcessId_fkey" FOREIGN KEY ("subProcessId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;
