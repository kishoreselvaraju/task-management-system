import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private auditService: AuditService,
  ) {}

  async findAll(user: User) {
    const fullUser = await this.userRepo.findOne({
      where: { id: user.id },
      relations: ['organization'],
    });
    if (!fullUser) throw new NotFoundException('User not found');

    return this.taskRepo.find({
      where: { organization: { id: fullUser.organization.id } },
      order: { order: 'ASC' },
    });
  }

  async create(user: User, dto: Partial<Task>) {
    const fullUser = await this.userRepo.findOne({
      where: { id: user.id },
      relations: ['organization'],
    });
    if (!fullUser) throw new NotFoundException('User not found');

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

  async update(id: string, dto: Partial<Task>, user: User) {
    const fullUser = await this.userRepo.findOne({
      where: { id: user.id },
      relations: ['organization'],
    });
    if (!fullUser) throw new NotFoundException('User not found');

    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['organization'],
    });
    if (!task) throw new NotFoundException('Task not found');
    if (task.organization.id !== fullUser.organization.id) {
      throw new NotFoundException('Task not in your org');
    }

    Object.assign(task, dto);
    const saved = await this.taskRepo.save(task);

    await this.auditService.log('UPDATE_TASK', user.id, `task:${id}`, dto);
    return saved;
  }

  async remove(id: string, user: User) {
    const fullUser = await this.userRepo.findOne({
      where: { id: user.id },
      relations: ['organization'],
    });
    if (!fullUser) throw new NotFoundException('User not found');

    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['organization'],
    });
    if (!task) throw new NotFoundException('Task not found');
    if (task.organization.id !== fullUser.organization.id) {
      throw new NotFoundException('Task not in your org');
    }

    await this.taskRepo.remove(task);
    await this.auditService.log('DELETE_TASK', user.id, `task:${id}`);
    return { deleted: true };
  }
}
