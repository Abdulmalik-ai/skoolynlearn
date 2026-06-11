-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_student_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "gradeLevel" TEXT,
    "interests" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "student_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_student_profiles" ("createdAt", "gradeLevel", "id", "interests", "updatedAt", "userId") SELECT "createdAt", "gradeLevel", "id", "interests", "updatedAt", "userId" FROM "student_profiles";
DROP TABLE "student_profiles";
ALTER TABLE "new_student_profiles" RENAME TO "student_profiles";
CREATE UNIQUE INDEX "student_profiles_userId_key" ON "student_profiles"("userId");
CREATE INDEX "student_profiles_userId_idx" ON "student_profiles"("userId");
CREATE TABLE "new_teacher_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "bio" TEXT,
    "subjects" TEXT,
    "resumeUrl" TEXT,
    "rejectionReason" TEXT,
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,
    "education" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "teacher_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_teacher_profiles" ("bio", "createdAt", "education", "id", "rejectionReason", "resumeUrl", "status", "subjects", "updatedAt", "userId", "yearsExperience") SELECT "bio", "createdAt", "education", "id", "rejectionReason", "resumeUrl", "status", "subjects", "updatedAt", "userId", "yearsExperience" FROM "teacher_profiles";
DROP TABLE "teacher_profiles";
ALTER TABLE "new_teacher_profiles" RENAME TO "teacher_profiles";
CREATE UNIQUE INDEX "teacher_profiles_userId_key" ON "teacher_profiles"("userId");
CREATE INDEX "teacher_profiles_userId_idx" ON "teacher_profiles"("userId");
CREATE INDEX "teacher_profiles_status_idx" ON "teacher_profiles"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
