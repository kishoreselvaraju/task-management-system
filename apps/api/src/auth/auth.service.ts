import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    console.log(' Trying login for', email); /// Debug
    const user = await this.userRepo.findOne({ where: { email } });
    console.log('Found user in DB:', user); ///Debug
    if (!user) throw new UnauthorizedException('Invalid credentials');
  
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch); ///Debug
  
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    return user;
  }
  

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organization?.id,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
