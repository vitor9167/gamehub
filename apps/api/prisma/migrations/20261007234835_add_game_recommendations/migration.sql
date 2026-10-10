-- CreateEnum
CREATE TYPE "RecommendationAspectType" AS ENUM ('STORY', 'GAMEPLAY', 'MECHANICS', 'ATMOSPHERE', 'EXPLORATION', 'PROGRESSION', 'DIFFICULTY', 'MULTIPLAYER', 'ART_STYLE', 'SOUNDTRACK');

-- CreateTable
CREATE TABLE "GameRecommendation" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "sourceGameId" UUID NOT NULL,
    "recommendedGameId" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationAspect" (
    "id" UUID NOT NULL,
    "recommendationId" UUID NOT NULL,
    "type" "RecommendationAspectType" NOT NULL,

    CONSTRAINT "RecommendationAspect_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameRecommendation_sourceGameId_idx" ON "GameRecommendation"("sourceGameId");

-- CreateIndex
CREATE INDEX "GameRecommendation_recommendedGameId_idx" ON "GameRecommendation"("recommendedGameId");

-- CreateIndex
CREATE INDEX "GameRecommendation_userId_idx" ON "GameRecommendation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GameRecommendation_userId_sourceGameId_recommendedGameId_key" ON "GameRecommendation"("userId", "sourceGameId", "recommendedGameId");

-- CreateIndex
CREATE INDEX "RecommendationAspect_recommendationId_idx" ON "RecommendationAspect"("recommendationId");

-- CreateIndex
CREATE UNIQUE INDEX "RecommendationAspect_recommendationId_type_key" ON "RecommendationAspect"("recommendationId", "type");

-- AddForeignKey
ALTER TABLE "GameRecommendation" ADD CONSTRAINT "GameRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRecommendation" ADD CONSTRAINT "GameRecommendation_sourceGameId_fkey" FOREIGN KEY ("sourceGameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRecommendation" ADD CONSTRAINT "GameRecommendation_recommendedGameId_fkey" FOREIGN KEY ("recommendedGameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationAspect" ADD CONSTRAINT "RecommendationAspect_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "GameRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
