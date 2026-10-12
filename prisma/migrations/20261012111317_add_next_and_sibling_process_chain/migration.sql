-- AlterTable
ALTER TABLE "Process" ADD COLUMN     "nextProcessId" TEXT,
ADD COLUMN     "nextProcessNote" TEXT;

-- CreateIndex
CREATE INDEX "Process_nextProcessId_idx" ON "Process"("nextProcessId");

-- AddForeignKey
ALTER TABLE "Process" ADD CONSTRAINT "Process_nextProcessId_fkey" FOREIGN KEY ("nextProcessId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;
