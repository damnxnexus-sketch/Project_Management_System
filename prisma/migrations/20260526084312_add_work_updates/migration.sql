-- CreateTable
CREATE TABLE "WorkUpdate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "taskId" TEXT,
    "workDone" TEXT NOT NULL,
    "hoursSpent" REAL,
    "progressAdded" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT,
    "priority" TEXT,
    "blockers" TEXT,
    "nextSteps" TEXT,
    "attachments" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkUpdate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkUpdate_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
