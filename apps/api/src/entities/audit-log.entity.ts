import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
//Basically this table shows the logs 
@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string; // e.g. CREATE_TASK, UPDATE_TASK, DELETE_TASK

  @Column()
  userId: number;

  @Column()
  resource: string; // e.g. "task:123", "user:45"

  @Column('text', { nullable: true })
  meta?: string; // optional JSON payload stored as text

  @CreateDateColumn()
  createdAt: Date;
}
