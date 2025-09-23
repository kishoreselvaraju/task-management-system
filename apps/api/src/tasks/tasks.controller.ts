import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role, User } from '../entities/user.entity';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // 🔹 Any logged-in user in org can view tasks
  @Get()
  async findAll(@Request() req: { user: User }) {
    return this.tasksService.findAll(req.user);
  }

  // 🔹 Only OWNER + ADMIN can create
  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  async create(@Request() req: { user: User }, @Body() dto: any) {
    return this.tasksService.create(req.user, dto);
  }

  // 🔹 Only OWNER + ADMIN can update
  @Put(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: any,
    @Request() req: { user: User },
  ) {
    return this.tasksService.update(id, dto, req.user);
  }

  // 🔹 Only OWNER + ADMIN can delete
  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async remove(@Param('id') id: string, @Request() req: { user: User }) {
    return this.tasksService.remove(id, req.user);
  }
}
