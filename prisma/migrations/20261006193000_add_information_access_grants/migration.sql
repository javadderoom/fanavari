-- CreateTable
CREATE TABLE "InformationAccessGrant" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "departmentId" TEXT,
    "roleName" TEXT,
    "claimToken" TEXT,
    "claimExpiresAt" TIMESTAMP(3),
    "permission" TEXT NOT NULL DEFAULT 'view',
    "grantedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InformationAccessGrant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InformationAccessGrant_claimToken_key" ON "InformationAccessGrant"("claimToken");

-- CreateIndex
CREATE INDEX "InformationAccessGrant_postId_idx" ON "InformationAccessGrant"("postId");

-- CreateIndex
CREATE INDEX "InformationAccessGrant_userId_idx" ON "InformationAccessGrant"("userId");

-- CreateIndex
CREATE INDEX "InformationAccessGrant_departmentId_idx" ON "InformationAccessGrant"("departmentId");

-- CreateIndex
CREATE INDEX "InformationAccessGrant_roleName_idx" ON "InformationAccessGrant"("roleName");

-- AddForeignKey
ALTER TABLE "InformationAccessGrant" ADD CONSTRAINT "InformationAccessGrant_postId_fkey" FOREIGN KEY ("postId") REFERENCES "InformationPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InformationAccessGrant" ADD CONSTRAINT "InformationAccessGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InformationAccessGrant" ADD CONSTRAINT "InformationAccessGrant_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InformationAccessGrant" ADD CONSTRAINT "InformationAccessGrant_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
