-- CreateTable
CREATE TABLE "ProcessFeedback" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "userId" TEXT,
    "isHelpful" BOOLEAN NOT NULL,
    "reason" TEXT,
    "comment" TEXT,
    "stepKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProcessFeedback_processId_idx" ON "ProcessFeedback"("processId");

-- CreateIndex
CREATE INDEX "ProcessFeedback_createdAt_idx" ON "ProcessFeedback"("createdAt");

-- AddForeignKey
ALTER TABLE "ProcessFeedback" ADD CONSTRAINT "ProcessFeedback_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessFeedback" ADD CONSTRAINT "ProcessFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
