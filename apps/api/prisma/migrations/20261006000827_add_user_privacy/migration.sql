-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isLibraryPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isProfilePublic" BOOLEAN NOT NULL DEFAULT true;
