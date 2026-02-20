import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards, ParseIntPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiParam,
  ApiCreatedResponse, ApiOkResponse,
  ApiBadRequestResponse, ApiUnauthorizedResponse,
  ApiForbiddenResponse, ApiNotFoundResponse
} from '@nestjs/swagger';
import { RolesGuard, Roles, CurrentUser } from '@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/auth';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MessageResponseDto } from '../dto/ResponseDTO';
import {
  Role, AuthenticatedUser,
} from '@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/data';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';

@ApiTags('Tasks')
@ApiBearerAuth('JWT')
@UseGuards(AuthGuard('jwt'), RolesGuard) 
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  @Roles(Role.OWNER, Role.ADMIN) 
  @ApiOperation({
    summary:     'Create a task',
    description: 'owner_id and organization_id are set from your JWT — cannot be spoofed.',
  })
  @ApiCreatedResponse({ type: Task })
  @ApiBadRequestResponse({    description: 'title is required' })
  @ApiUnauthorizedResponse({  description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({     description: 'Viewer role cannot create tasks' })
  create(
    @Body()        dto:  CreateTaskDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Task> {
    return this.tasksService.create(dto, user);
  }


  @Get()
  @ApiOperation({
    summary:     'List tasks',
    description:
      'Owner/Admin → all tasks in their org. ' +
      'Viewer → only their own tasks.',
  })
  @ApiOkResponse({ type: [Task] })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  findAll(@CurrentUser() user: AuthenticatedUser): Promise<Task[]> {
    return this.tasksService.findAll(user);
  }

  @Put(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({
    summary:     'Update a task',
    description: 'Owner → any task in org. Admin → only own tasks.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: Task })
  @ApiBadRequestResponse({    description: 'Invalid request body' })
  @ApiUnauthorizedResponse({  description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({     description: 'Admin editing another user\'s task' })
  @ApiNotFoundResponse({      description: 'Task not found' })
  update(
    @Param('id', ParseIntPipe) id:   number,
    @Body()                    dto:  UpdateTaskDto,
    @CurrentUser()             user: AuthenticatedUser,
  ): Promise<Task> {
    return this.tasksService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  @ApiOperation({
    summary:     'Delete a task',
    description: 'Owner → any task in org. Admin → only own tasks.',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiUnauthorizedResponse({  description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({     description: 'Admin deleting another user\'s task' })
  @ApiNotFoundResponse({      description: 'Task not found' })
  remove(
    @Param('id', ParseIntPipe) id:   number,
    @CurrentUser()             user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    return this.tasksService.remove(id, user);
  }
}