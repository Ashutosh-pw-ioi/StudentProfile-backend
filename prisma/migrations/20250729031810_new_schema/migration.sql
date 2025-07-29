-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "firstLoggedIn" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "firstLoggedIn" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "teachers" ADD COLUMN     "firstLoggedIn" BOOLEAN NOT NULL DEFAULT false;
