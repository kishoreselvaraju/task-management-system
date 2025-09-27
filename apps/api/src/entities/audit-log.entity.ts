import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';
//Basically this table shows the logs 
@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string; // e.g. CREATE_TASK, UPDATE_TASK, DELETE_TASK

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  resource: string; // e.g. "task:123", "user:45"

  @Column('text', { nullable: true })
  meta?: string; // optional JSON payload stored as text

  @CreateDateColumn()
  createdAt: Date;
  @ManyToOne(() => User, (user) => user.auditLogs, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true,
  })
  user: User;

  
  @ManyToOne(() => Organization, (org) => org.auditLogs, { eager: true })
  organization: Organization;
}
