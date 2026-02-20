import {
  Injectable, NotFoundException, ForbiddenException
} from '@nestjs/common';
import { InjectRepository }  from '@nestjs/typeorm';
import { Repository }        from 'typeorm';
import { Task }              from './entities/task.entity';
import { CreateTaskDto }     from './dto/create-task.dto';
import { UpdateTaskDto }     from './dto/update-task.dto';
import {
  Role, AuditAction, AuthenticatedUser,
  TaskStatus
} from '@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/data';
import { AuditService }      from '../audit/audit.service';
import { UsersService }      from '../users/users.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepo: Repository<Task>,
    private auditService: AuditService,
    private usersService: UsersService,
  ) {}

  async create(dto: CreateTaskDto, user: AuthenticatedUser): Promise<Task> {
    if (dto.assignedToId) {
      const assignee = await this.usersService.findById(dto.assignedToId);
      if (!assignee || assignee.organizationId !== user.organizationId) {
        throw new ForbiddenException(
          'Assigned user does not belong to your organization'
        );
      }
    }

    const saved = await this.tasksRepo.save(
      this.tasksRepo.create({
        title:          dto.title,
        description:    dto.description,
        ownerId:        user.id,
        assignedToId:   dto.assignedToId ?? user.id,
        organizationId: user.organizationId,
        status: dto.status ?? TaskStatus.TODO
      }),
    );
    const fresh = await this.findOneOrFail(saved.id);
    await this.auditService.log(
      user, AuditAction.CREATE_TASK, fresh.id,
      `title="${fresh.title}" assignedTo=${fresh.assignedToId}`
    );
    return fresh;
  }

  async findAll(user: AuthenticatedUser): Promise<Task[]> {
    await this.auditService.log(user, AuditAction.VIEW_TASKS);
    if (user.role === Role.VIEWER) {
      return this.tasksRepo.find({
        where: [
          { organizationId: user.organizationId, assignedToId: user.id },
          { organizationId: user.organizationId, ownerId:     user.id },
        ],
        relations: { owner: true, assignedTo: true },
        order:     { createdAt: 'DESC' },
      });
    }
    return this.tasksRepo.find({
      where:     { organizationId: user.organizationId },
      relations: { owner: true, assignedTo: true },    
      order:     { createdAt: 'DESC' },
    });
  }
  async update(
    id:   number,
    dto:  UpdateTaskDto,
    user: AuthenticatedUser,
  ): Promise<Task> {
    const task = await this.findOneOrFail(id);
    this.assertSameOrg(task, user);
    this.assertCanModify(task, user, 'edit');
    if (dto.assignedToId) {
      const assignee = await this.usersService.findById(dto.assignedToId);
      if (!assignee || assignee.organizationId !== user.organizationId) {
        throw new ForbiddenException(
          'Assigned user does not belong to your organization'
        );
      }
      task.assignedTo = assignee; 
    }

    Object.assign(task, dto);
    await this.tasksRepo.save(task);
    const fresh = await this.findOneOrFail(id);
    await this.auditService.log(user, AuditAction.UPDATE_TASK, id);
    return fresh;
  }
  async remove(
    id:   number,
    user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    const task = await this.findOneOrFail(id);
    this.assertSameOrg(task, user);
    this.assertCanModify(task, user, 'delete');
    await this.tasksRepo.delete(id);
    await this.auditService.log(
      user, AuditAction.DELETE_TASK, id, `title="${task.title}"`
    );
    return { message: `Task #${id} deleted successfully` };
  }
  private async findOneOrFail(id: number): Promise<Task> {
    const task = await this.tasksRepo.findOne({
      where:     { id },
      relations: { owner: true, assignedTo: true },
    });
    if (!task) throw new NotFoundException(`Task #${id} not found`);
    return task;
  }

  private assertSameOrg(task: Task, user: AuthenticatedUser): void {
    if (task.organizationId !== user.organizationId) {
      throw new ForbiddenException(
        'Task does not belong to your organization'
      );
    }
  }

  private assertCanModify(
    task:   Task,
    user:   AuthenticatedUser,
    action: 'edit' | 'delete',
  ): void {
    if (user.role === Role.OWNER) return;
    if (user.role === Role.ADMIN) {
      if (task.ownerId !== user.id) {
        throw new ForbiddenException(
          `Admins can only ${action} their own tasks`
        );
      }
      return;
    }
    throw new ForbiddenException('Insufficient permissions');
  }
}