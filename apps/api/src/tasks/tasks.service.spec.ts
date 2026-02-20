// apps/api/src/tasks/tasks.service.spec.ts
import { Test, TestingModule }           from '@nestjs/testing';
import { getRepositoryToken }            from '@nestjs/typeorm';
import { ForbiddenException,
         NotFoundException }             from '@nestjs/common';
import { TasksService }                  from './tasks.service';
import { Task }                          from './entities/task.entity';
import { AuditService }                  from '../audit/audit.service';
import { UsersService }                  from '../users/users.service';
import { Role, AuditAction, TaskStatus } from '@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/data';

// ── Fixtures ──────────────────────────────────────────────────

const ownerUser = {
  id: 1, email: 'testing@gmail.com',
  role: Role.OWNER, organizationId: 1,
};

const adminUser = {
  id: 2, email: 'testing2@acme.com',
  role: Role.ADMIN, organizationId: 1,
};

const viewerUser = {
  id: 3, email: 'testing3@acme.com',
  role: Role.VIEWER, organizationId: 1,
};

const makeTask = (overrides = {}): Task => ({
  id:             1,
  title:          'Test Task',
  description:    'desc',
  ownerId:        1,
  assignedToId:   1,
  organizationId: 1,
  status:         TaskStatus.TODO,
  createdAt:      new Date(),
  updatedAt:      new Date(),
  owner:          null as any,
  assignedTo:     null as any,
  ...overrides,
});

const mockRepo = {
  findOne:  jest.fn(),
  find:     jest.fn(),
  create:   jest.fn(),
  save:     jest.fn(),
  delete:   jest.fn(),
};

const mockAuditService = {
  log: jest.fn().mockResolvedValue(undefined),
};

const mockUsersService = {
  findById: jest.fn(),
};

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide:  getRepositoryToken(Task),
          useValue: mockRepo,
        },
        {
          provide:  AuditService,
          useValue: mockAuditService,
        },
        {
          provide:  UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should set ownerId and organizationId from JWT user and not from DTO', async () => {
      const saved = makeTask();
      mockRepo.create.mockReturnValue(saved);
      mockRepo.save.mockResolvedValue(saved);
      mockRepo.findOne.mockResolvedValue(saved);  
      await service.create(
        { title: 'Test Task' },
        ownerUser as any,
      );
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ownerId:        ownerUser.id,
          organizationId: ownerUser.organizationId,
        }),
      );
    });

    it('should default assignedToId to ownerId when not provided', async () => {
      const saved = makeTask();
      mockRepo.create.mockReturnValue(saved);
      mockRepo.save.mockResolvedValue(saved);
      mockRepo.findOne.mockResolvedValue(saved);

      await service.create({ title: 'Test Task' }, ownerUser as any);

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          assignedToId: ownerUser.id,  
        }),
      );
    });
    it('should validate assignedToId belongs to same org', async () => {
      mockUsersService.findById.mockResolvedValue({
        id: 99, organizationId: 999,  
      });
      await expect(
        service.create(
          { title: 'Task', assignedToId: 99 },
          ownerUser as any,
        )
      ).rejects.toThrow(ForbiddenException);
    });

    it('should log CREATE_TASK after saving', async () => {
      const saved = makeTask();
      mockRepo.create.mockReturnValue(saved);
      mockRepo.save.mockResolvedValue(saved);
      mockRepo.findOne.mockResolvedValue(saved);
      await service.create({ title: 'Test Task' }, ownerUser as any);
      expect(mockAuditService.log).toHaveBeenCalledWith(
        ownerUser,
        AuditAction.CREATE_TASK,
        saved.id,
        expect.any(String),
      );
    });
  });

  describe('findAll()', () => {
    it('OWNER should query by org only — no assignedToId filter', async () => {
      mockRepo.find.mockResolvedValue([]);
      await service.findAll(ownerUser as any);
      expect(mockRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: ownerUser.organizationId },
        }),
      );
    });

    it('ADMIN should query by org only — no assignedToId filter', async () => {
      mockRepo.find.mockResolvedValue([]);
      await service.findAll(adminUser as any);
      expect(mockRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: adminUser.organizationId },
        }),
      );
    });

    it('VIEWER should get assignedToId OR ownerId filter', async () => {
      mockRepo.find.mockResolvedValue([]);
      await service.findAll(viewerUser as any);
      expect(mockRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: [
            { organizationId: viewerUser.organizationId, assignedToId: viewerUser.id },
            { organizationId: viewerUser.organizationId, ownerId: viewerUser.id },
          ],
        }),
      );
    });

    it('should load owner and assignedTo relations', async () => {
      mockRepo.find.mockResolvedValue([]);
      await service.findAll(ownerUser as any);
      expect(mockRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: { owner: true, assignedTo: true },
        }),
      );
    });

    it('should log VIEW_TASKS for every role', async () => {
      mockRepo.find.mockResolvedValue([]);
      await service.findAll(viewerUser as any);
      expect(mockAuditService.log).toHaveBeenCalledWith(
        viewerUser,
        AuditAction.VIEW_TASKS,
      );
    });
  });

  describe('update()', () => {
    it('OWNER should update any task in their org', async () => {
      const task  = makeTask({ ownerId: 99 }); 
      const fresh = makeTask({ title: 'Updated' });
      mockRepo.findOne
        .mockResolvedValueOnce(task)   
        .mockResolvedValueOnce(fresh); 
      mockRepo.save.mockResolvedValue(fresh);
      const result = await service.update(
        1, { title: 'Updated' }, ownerUser as any
      );
      expect(result.title).toBe('Updated');
    });

    it('ADMIN should update their own task', async () => {
      const task  = makeTask({ ownerId: adminUser.id });
      const fresh = makeTask({ title: 'Updated' });
      mockRepo.findOne
        .mockResolvedValueOnce(task)
        .mockResolvedValueOnce(fresh);
      mockRepo.save.mockResolvedValue(fresh);
      const result = await service.update(
        1, { title: 'Updated' }, adminUser as any
      );
      expect(result.title).toBe('Updated');
    });

    it('ADMIN should throw ForbiddenException on another user\'s task', async () => {
      const task = makeTask({ ownerId: 99 });
      mockRepo.findOne.mockResolvedValue(task);
      await expect(
        service.update(1, { title: 'X' }, adminUser as any)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for non-existent task', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(
        service.update(999, { title: 'X' }, ownerUser as any)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for cross-org access', async () => {
      const task = makeTask({ organizationId: 999 }); 
      mockRepo.findOne.mockResolvedValue(task);
      await expect(
        service.update(1, { title: 'X' }, ownerUser as any)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should validate assignedToId org on update', async () => {
      const task = makeTask({ ownerId: ownerUser.id });
      mockRepo.findOne.mockResolvedValue(task);
      mockUsersService.findById.mockResolvedValue({
        id: 99, organizationId: 999,
      });

      await expect(
        service.update(1, { assignedToId: 99 }, ownerUser as any)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should log UPDATE_TASK on success', async () => {
      const task  = makeTask({ ownerId: ownerUser.id });
      const fresh = makeTask();
      mockRepo.findOne
        .mockResolvedValueOnce(task)
        .mockResolvedValueOnce(fresh);
      mockRepo.save.mockResolvedValue(fresh);
      await service.update(1, { title: 'Updated' }, ownerUser as any);
      expect(mockAuditService.log).toHaveBeenCalledWith(
        ownerUser,
        AuditAction.UPDATE_TASK,
        1,
      );
    });
  });

  describe('remove()', () => {
    it('OWNER should delete any task in their org', async () => {
      const task = makeTask({ ownerId: 99 }); 
      mockRepo.findOne.mockResolvedValue(task);
      mockRepo.delete.mockResolvedValue({ affected: 1 });
      const result = await service.remove(1, ownerUser as any);
      expect(result.message).toContain('deleted');
    });

    it('ADMIN should delete their own task', async () => {
      const task = makeTask({ ownerId: adminUser.id });
      mockRepo.findOne.mockResolvedValue(task);
      mockRepo.delete.mockResolvedValue({ affected: 1 });
      const result = await service.remove(1, adminUser as any);
      expect(result.message).toContain('deleted');
    });

    it('ADMIN should throw ForbiddenException on another user\'s task', async () => {
      const task = makeTask({ ownerId: 99 });
      mockRepo.findOne.mockResolvedValue(task);
      await expect(
        service.remove(1, adminUser as any)
      ).rejects.toThrow(ForbiddenException);
    });
    it('should throw NotFoundException for non-existent task', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(
        service.remove(999, ownerUser as any)
      ).rejects.toThrow(NotFoundException);
    });

    it('should log DELETE_TASK with title snapshot', async () => {
      const task = makeTask({ ownerId: ownerUser.id, title: 'My Task' });
      mockRepo.findOne.mockResolvedValue(task);
      mockRepo.delete.mockResolvedValue({ affected: 1 });
      await service.remove(1, ownerUser as any);
      expect(mockAuditService.log).toHaveBeenCalledWith(
        ownerUser,
        AuditAction.DELETE_TASK,
        1,
        expect.stringContaining('My Task'),
      );
    });
  });
});