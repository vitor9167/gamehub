-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('LIBRARY_ADDED', 'LIBRARY_STATUS_CHANGED', 'REVIEW_CREATED');

-- CreateTable
CREATE TABLE "Activity" (
    "id" UUID NOT NULL,
    "type" "ActivityType" NOT NULL,
    "userId" UUID NOT NULL,
    "gameId" UUID,
    "reviewId" UUID,
    "status" "GameStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewLikeId" UUID,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_userId_createdAt_idx" ON "Activity"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_reviewLikeId_fkey" FOREIGN KEY ("reviewLikeId") REFERENCES "ReviewLike"("id") ON DELETE SET NULL ON UPDATE CASCADE;
