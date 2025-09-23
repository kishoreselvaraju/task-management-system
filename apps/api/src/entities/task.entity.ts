import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';

export enum TaskStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'text',
    default: TaskStatus.NEW,
  })
  status: TaskStatus;

  @Column({ default: 0 })
  order: number;
  
  @Column({ default: 'General' })
category: string;


  @ManyToOne(() => User, (user) => user.tasks, { eager: true })
  owner: User;

  @ManyToOne(() => Organization, (org) => org.tasks, { eager: true })
  organization: Organization;
}
