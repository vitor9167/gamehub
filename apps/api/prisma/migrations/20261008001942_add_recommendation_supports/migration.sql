-- CreateTable
CREATE TABLE "RecommendationSupport" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "recommendationId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecommendationSupport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecommendationSupport_userId_idx" ON "RecommendationSupport"("userId");

-- CreateIndex
CREATE INDEX "RecommendationSupport_recommendationId_idx" ON "RecommendationSupport"("recommendationId");

-- CreateIndex
CREATE UNIQUE INDEX "RecommendationSupport_userId_recommendationId_key" ON "RecommendationSupport"("userId", "recommendationId");

-- AddForeignKey
ALTER TABLE "RecommendationSupport" ADD CONSTRAINT "RecommendationSupport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationSupport" ADD CONSTRAINT "RecommendationSupport_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "GameRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
