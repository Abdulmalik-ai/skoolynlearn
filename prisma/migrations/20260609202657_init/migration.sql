/*
  Warnings:

  - You are about to drop the column `description` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `lessons` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `lessons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "assignments" ADD COLUMN "filePath" TEXT;

-- AlterTable
ALTER TABLE "chat_messages" ADD COLUMN "filePath" TEXT;

-- AlterTable
ALTER TABLE "courses" ADD COLUMN "freeUntil" DATETIME;

-- AlterTable
ALTER TABLE "group_posts" ADD COLUMN "imagePath" TEXT;

-- AlterTable
ALTER TABLE "submissions" ADD COLUMN "filePath" TEXT;

-- AlterTable
ALTER TABLE "teacher_profiles" ADD COLUMN "resumeFile" TEXT;

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "updatedById" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_lessons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filePath" TEXT,
    "duration" INTEGER,
    "moduleId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "lessons_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_lessons" ("createdAt", "duration", "id", "moduleId", "title", "type", "url") SELECT "createdAt", "duration", "id", "moduleId", "title", "type", "url" FROM "lessons";
DROP TABLE "lessons";
ALTER TABLE "new_lessons" RENAME TO "lessons";
CREATE INDEX "lessons_moduleId_idx" ON "lessons"("moduleId");
CREATE TABLE "new_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "courseId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    CONSTRAINT "reviews_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reviews_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_reviews" ("comment", "courseId", "createdAt", "id", "rating", "studentId", "updatedAt") SELECT "comment", "courseId", "createdAt", "id", "rating", "studentId", "updatedAt" FROM "reviews";
DROP TABLE "reviews";
ALTER TABLE "new_reviews" RENAME TO "reviews";
CREATE INDEX "reviews_courseId_idx" ON "reviews"("courseId");
CREATE UNIQUE INDEX "reviews_courseId_studentId_key" ON "reviews"("courseId", "studentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");
