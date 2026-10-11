-- AlterTable
ALTER TABLE "Process" ADD COLUMN     "isPopular" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Process_viewCount_idx" ON "Process"("viewCount");

-- CreateIndex
CREATE INDEX "Process_isPopular_idx" ON "Process"("isPopular");
