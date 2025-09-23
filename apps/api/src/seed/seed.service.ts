import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../entities/organization.entity';
import { User, Role } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Organization) private orgRepo: Repository<Organization>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    const orgCount = await this.orgRepo.count();
    if (orgCount > 0) return; // already seeded

    // Create Organization
    const parentOrg = this.orgRepo.create({ name: 'Acme Corp' });
    await this.orgRepo.save(parentOrg);

    // Create Users
    const password = await bcrypt.hash('password123', 10);

    const owner = this.userRepo.create({
      email: 'owner@acme.com',
      password,
      role: Role.OWNER,
      organization: parentOrg,
    });
    const admin = this.userRepo.create({
      email: 'admin@acme.com',
      password,
      role: Role.ADMIN,
      organization: parentOrg,
    });
    const viewer = this.userRepo.create({
      email: 'viewer@acme.com',
      password,
      role: Role.VIEWER,
      organization: parentOrg,
    });

    await this.userRepo.save([owner, admin, viewer]);

    console.log('✅ Seed complete: Users created -> owner@acme.com / admin@acme.com / viewer@acme.com (all password123)');
  }
}
