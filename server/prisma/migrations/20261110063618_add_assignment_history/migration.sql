-- AlterTable
ALTER TABLE "TicketHistory" ADD COLUMN     "newAssignedAgentId" TEXT,
ADD COLUMN     "oldAssignedAgentId" TEXT;

-- CreateIndex
CREATE INDEX "TicketHistory_oldAssignedAgentId_idx" ON "TicketHistory"("oldAssignedAgentId");

-- CreateIndex
CREATE INDEX "TicketHistory_newAssignedAgentId_idx" ON "TicketHistory"("newAssignedAgentId");

-- AddForeignKey
ALTER TABLE "TicketHistory" ADD CONSTRAINT "TicketHistory_oldAssignedAgentId_fkey" FOREIGN KEY ("oldAssignedAgentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketHistory" ADD CONSTRAINT "TicketHistory_newAssignedAgentId_fkey" FOREIGN KEY ("newAssignedAgentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
