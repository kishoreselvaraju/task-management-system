// apps/api/src/audit/audit.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditGateway } from './audit.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    forwardRef(() => AuthModule),   // ✅ reuse the same JwtModule from AuthModule
  ],
  providers: [AuditService, AuditGateway],
  controllers: [AuditController],
  exports: [AuditService],
})
export class AuditModule {}
