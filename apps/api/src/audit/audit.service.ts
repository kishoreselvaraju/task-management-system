import {
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditGateway } from './audit.gateway';
import { User, Role } from '../entities/user.entity';
import { Task } from '../entities/task.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    private gateway: AuditGateway,
  ) {}

  // Create audit entry with friendly resource & user
  async log(action: string, userId: string, resource: string, meta?: any) {
    let displayResource = resource;

    // If resource refers to a task, resolve title
    if (resource.startsWith('task:')) {
      const taskId = resource.split(':')[1];
      const task = await this.taskRepo.findOne({ where: { id: taskId } });
      if (task) {
        displayResource = `Task "${task.title}"`;
      }
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });

    const entry = this.auditRepo.create({
      action,
      user,                       
      resource: displayResource,  
      meta: meta ? JSON.stringify(meta) : null,
      organization: user?.organization || null,
    });

    const saved = await this.auditRepo.save(entry);

    this.gateway.broadcastNewAudit(saved);
    return saved;
  }

  // RBAC-protected query
  async findAll(user: User) {
    if (user.role === Role.ADMIN) {
      return this.auditRepo.find({
        order: { createdAt: 'DESC' },
        take: 50,
        relations: ['user', 'organization'],
      });
    }

    if (user.role === Role.OWNER) {
      if (!user.organization) {
        throw new ForbiddenException('No organization assigned');
      }
      return this.auditRepo.find({
        where: { organization: { id: user.organization.id } },
        order: { createdAt: 'DESC' },
        take: 50,
        relations: ['user', 'organization'],
      });
    }

    throw new ForbiddenException('Viewers cannot access audit logs');
  }
}
