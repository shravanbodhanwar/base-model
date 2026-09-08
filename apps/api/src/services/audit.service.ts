import { PrismaClient, AuditEvent, ScopeType } from '@prisma/client';

const prisma = new PrismaClient();

export class AuditService {
  async createAuditEvent(data: Partial<AuditEvent>): Promise<AuditEvent> {
    return prisma.auditEvent.create({
      data: data as any
    });
  }

  async getAuditEvents(filters: any, skip: number = 0, take: number = 50): Promise<AuditEvent[]> {
    return prisma.auditEvent.findMany({
      where: filters,
      orderBy: { timestamp: 'desc' },
      skip,
      take
    });
  }

  async exportAuditReport(filters: any): Promise<Buffer> {
    const events = await this.getAuditEvents(filters, 0, 10000);
    const csvHeader = 'ID,EventType,Action,Actor,Date,Status\\n';
    const csvRows = events.map(e => `\${e.id},\${e.eventType},\${e.action},\${e.actorId},\${e.timestamp},\${e.status}`);
    return Buffer.from(csvHeader + csvRows.join('\\n'));
  }
}

export const auditService = new AuditService();
