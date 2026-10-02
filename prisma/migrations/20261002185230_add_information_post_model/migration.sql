-- CreateTable
CREATE TABLE "InformationPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'announcement',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "departmentId" TEXT,
    "systemToolId" TEXT,
    "authorId" TEXT,
    "targetUrl" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InformationPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InformationPost_slug_key" ON "InformationPost"("slug");

-- AddForeignKey
ALTER TABLE "InformationPost" ADD CONSTRAINT "InformationPost_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InformationPost" ADD CONSTRAINT "InformationPost_systemToolId_fkey" FOREIGN KEY ("systemToolId") REFERENCES "SystemTool"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InformationPost" ADD CONSTRAINT "InformationPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
