import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';
import { AuditLog } from './audit-log.entity';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => Task, (task) => task.organization)   
  tasks: Task[];

  @OneToMany(() => AuditLog, (log) => log.organization)
auditLogs: AuditLog[];
}
