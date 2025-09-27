import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { Organization } from '../entities/organization.entity';



@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Organization) private orgRepo: Repository<Organization>,

  ) {}

  async findAll(requester: User) {
    if (requester.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can view all users');
    }
    return this.userRepo.find({ relations: ['organization'] });
  }

  async findOne(requester: User, id: string) {
    if (requester.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can view user details');
    }

    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['organization'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async createUser(requester: User, data: Partial<User>) {
    if (requester.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can create users');
    }

    let hashedPassword: string | undefined = undefined;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    //  Auto-create organization if not found
    let org: Organization | null = null;
    if (data.organization?.id || (data as any).organizationId) {
      const orgId = data.organization?.id || (data as any).organizationId;

      org = await this.orgRepo.findOne({ where: { id: orgId } });

      if (!org) {
        // Create new org automatically
        org = this.orgRepo.create({ name: orgId });
        org = await this.orgRepo.save(org);
      }
    } else {
      // No org provided → create one by default
      org = this.orgRepo.create({ name: `Acme Corp` });
      org = await this.orgRepo.save(org);
    }

    const user = this.userRepo.create({
      ...data,
      password: hashedPassword ?? data.password,
      organization: org,
    });

    return this.userRepo.save(user);
  }

  async updateUser(requester: User, id: string, changes: Partial<User>) {
    if (requester.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can update users');
    }

    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (changes.password) {
      changes.password = await bcrypt.hash(changes.password, 10);
    }

    Object.assign(user, changes);
    return this.userRepo.save(user);
  }

  async deleteUser(requester: User, id: string) {
    if (requester.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can delete users');
    }

    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.userRepo.remove(user);
  }
}
