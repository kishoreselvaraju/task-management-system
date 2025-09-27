import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from '../entities/task.entity';
import { User, Role } from '../entities/user.entity';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private auditService: AuditService,
  ) {}

  // FIND ALL
  async findAll(user: any) {
    if (user.role === Role.ADMIN) {
      // Admin sees everything
      return this.taskRepo.find({ order: { order: 'ASC' } });
    }

    if (!user.organizationId) {
      throw new ForbiddenException('No organization assigned');
    }

    // Owner & Viewer see only their org’s tasks
    return this.taskRepo.find({
      where: { organization: { id: user.organizationId } },
      order: { order: 'ASC' },
    });
  }

  // CREATE
  async create(user: User, dto: Partial<Task>) {
    const fullUser = await this.userRepo.findOne({
      where: { email: user.email },
      relations: ['organization'],
    });
    if (!fullUser) throw new NotFoundException('User not found');

    // Viewers cannot create
    if (fullUser.role === Role.VIEWER) {
      throw new ForbiddenException('Viewers cannot create tasks');
    }

    // Admins and Owners can create
    const task = this.taskRepo.create({
      ...dto,
      status: TaskStatus.NEW,
      owner: fullUser,
      organization: fullUser.organization,
    });

    const saved = await this.taskRepo.save(task);
    await this.auditService.log('CREATE_TASK', user.id, `task:${saved.id}`, dto);
    return saved;
  }

  // UPDATE
  async update(id: string, dto: Partial<Task>, user: User) {
    const fullUser = await this.userRepo.findOne({
      where: { email: user.email },
      relations: ['organization'],
    });
    if (!fullUser) throw new NotFoundException('User not found');

    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['organization'],
    });
    if (!task) throw new NotFoundException('Task not found');

    // Viewers cannot update
    if (fullUser.role === Role.VIEWER) {
      throw new ForbiddenException('Viewers cannot update tasks');
    }

    // Owners cannot update tasks outside their org
    if (
      fullUser.role === Role.OWNER &&
      task.organization.id !== fullUser.organization.id
    ) {
      throw new ForbiddenException(
        'Owners cannot update tasks outside their organization',
      );
    }

    //  Admin can edit anything
    Object.assign(task, dto);
    const saved = await this.taskRepo.save(task);
    await this.auditService.log('UPDATE_TASK', user.id, `task:${id}`, dto);
    return saved;
  }

  //  DELETE
  async remove(id: string, user: User) {
    const fullUser = await this.userRepo.findOne({
      where: { email: user.email },
      relations: ['organization'],
    });
    if (!fullUser) throw new NotFoundException('User not found');

    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['organization'],
    });
    if (!task) throw new NotFoundException('Task not found');

    // Viewers cannot delete
    if (fullUser.role === Role.VIEWER) {
      throw new ForbiddenException('Viewers cannot delete tasks');
    }

    //  Owners cannot delete tasks outside their org
    if (
      fullUser.role === Role.OWNER &&
      task.organization.id !== fullUser.organization.id
    ) {
      throw new ForbiddenException(
        'Owners cannot delete tasks outside their organization',
      );
    }

    // Admin can delete anything
    await this.taskRepo.remove(task);
    await this.auditService.log('DELETE_TASK', user.id, `task:${id}`);
    return { deleted: true };
  }
}
