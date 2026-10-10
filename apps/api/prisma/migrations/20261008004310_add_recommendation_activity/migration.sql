-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'RECOMMENDATION_CREATED';

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "recommendationId" UUID;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "GameRecommendation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
