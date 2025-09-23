import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { AuditModule } from './audit/audit.module';
import { User } from './entities/user.entity';
import { Task } from './entities/task.entity';
import { AuditLog } from './entities/audit-log.entity';
import { Organization } from './entities/organization.entity';

@Module({
  imports: [
    // ✅ DB connection
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [User, Task, AuditLog, Organization],
      synchronize: true, // ⚠️ ok for dev, use migrations in prod
    }),

    // ✅ feature modules
    AuthModule,
    TasksModule,
    AuditModule,
  ],
})
export class AppModule {}
