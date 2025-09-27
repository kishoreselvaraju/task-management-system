import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard) // all endpoints protected
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async findAll(@Req() req: Request) {
    const user = req.user as User;
    return this.userService.findAll(user);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as User;
    return this.userService.findOne(user, id);
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: Partial<User>) {
    const user = req.user as User;
    return this.userService.createUser(user, dto);
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: Partial<User>,
  ) {
    const user = req.user as User;
    return this.userService.updateUser(user, id, dto);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as User;
    return this.userService.deleteUser(user, id);
  }
}
