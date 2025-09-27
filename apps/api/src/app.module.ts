import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { AuditModule } from './audit/audit.module';
import { UsersModule } from './users/users.module';

import { User } from './entities/user.entity';
import { Task } from './entities/task.entity';
import { AuditLog } from './entities/audit-log.entity';
import { Organization } from './entities/organization.entity';

import { SeedService } from './seed/seed.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [User, Task, AuditLog, Organization],
      synchronize: true,
    }),

    // Add for repositories inside this module
    TypeOrmModule.forFeature([User, Organization]),

    AuthModule,
    TasksModule,
    AuditModule,
    UsersModule,
  ],
  providers: [SeedService],  // seeder runs
})
export class AppModule {}
