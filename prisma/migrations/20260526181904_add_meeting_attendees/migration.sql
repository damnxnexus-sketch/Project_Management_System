-- CreateTable
CREATE TABLE "_MeetingAttendees" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_MeetingAttendees_A_fkey" FOREIGN KEY ("A") REFERENCES "Meeting" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MeetingAttendees_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_MeetingAttendees_AB_unique" ON "_MeetingAttendees"("A", "B");

-- CreateIndex
CREATE INDEX "_MeetingAttendees_B_index" ON "_MeetingAttendees"("B");
