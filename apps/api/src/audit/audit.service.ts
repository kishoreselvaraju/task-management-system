import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditGateway } from './audit.gateway';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
    private gateway: AuditGateway,
  ) {}

  async log(action: string, userId: number, resource: string, meta?: any) {
    const entry = this.auditRepo.create({
      action,
      userId,
      resource,
      meta: meta ? JSON.stringify(meta) : null,
    });
    const saved = await this.auditRepo.save(entry);

    // 🚀 Push to all connected clients
    this.gateway.broadcastNewAudit(saved);
  }

  async findAll() {
    return this.auditRepo.find({
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}
