-- CreateTable
CREATE TABLE "WorkflowRun" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "runNumber" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "operatorId" TEXT,
    "operatorName" TEXT NOT NULL,
    "operatorRole" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "totalDurationSeconds" INTEGER,
    "completedStepsCount" INTEGER NOT NULL DEFAULT 0,
    "totalStepsCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "supervisorId" TEXT,
    "supervisorName" TEXT,
    "supervisorApprovalStatus" TEXT NOT NULL DEFAULT 'none',
    "supervisorApprovedAt" TIMESTAMP(3),
    "supervisorNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowStepLog" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "stepId" TEXT,
    "stepKey" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "stepTitle" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationSeconds" INTEGER,
    "operatorNotes" TEXT,
    "isCheckpoint" BOOLEAN NOT NULL DEFAULT false,
    "supervisorSignOff" BOOLEAN NOT NULL DEFAULT false,
    "supervisorSignedBy" TEXT,
    "supervisorSignedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkflowStepLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkflowRun_processId_idx" ON "WorkflowRun"("processId");

-- CreateIndex
CREATE INDEX "WorkflowRun_operatorId_idx" ON "WorkflowRun"("operatorId");

-- CreateIndex
CREATE INDEX "WorkflowRun_status_idx" ON "WorkflowRun"("status");

-- CreateIndex
CREATE INDEX "WorkflowStepLog_runId_idx" ON "WorkflowStepLog"("runId");

-- CreateIndex
CREATE INDEX "WorkflowStepLog_stepKey_idx" ON "WorkflowStepLog"("stepKey");

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStepLog" ADD CONSTRAINT "WorkflowStepLog_runId_fkey" FOREIGN KEY ("runId") REFERENCES "WorkflowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
