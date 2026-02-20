import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditLog } from './entities/audit-log.entity';
import { AuditAction, Role, AuthenticatedUser } from '@vpatel-ade0ed66-49b7-4b28-986a-a9e2e299702c/data';

describe('AuditService', () => {
  let service: AuditService;
  const mockRepo = {
    create: jest.fn(),
    save:   jest.fn().mockResolvedValue(undefined),
    find:   jest.fn(),
  };
  const mockUser: AuthenticatedUser = {
    id:             1,
    name:           'Alice',
    email:          'alice@test.com',
    role:           Role.OWNER,
    organizationId: 1,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: getRepositoryToken(AuditLog), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('log()', () => {
    it('should create and save audit log entry', async () => {
      const entry = { id: 1 };
      mockRepo.create.mockReturnValue(entry);
      await service.log(mockUser, AuditAction.CREATE_TASK, 5, 'title="Task"');
      expect(mockRepo.create).toHaveBeenCalledWith({
        userId:    mockUser.id,
        userEmail: mockUser.email,
        userRole:  mockUser.role,
        action:    AuditAction.CREATE_TASK,
        resourceId: 5,
        detail:    'title="Task"',
      });
      expect(mockRepo.save).toHaveBeenCalledWith(entry);
    });

    it('should work without optional resourceId and detail', async () => {
      mockRepo.create.mockReturnValue({});
      await expect(
        service.log(mockUser, AuditAction.VIEW_TASKS)
      ).resolves.not.toThrow();
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action:     AuditAction.VIEW_TASKS,
          resourceId: undefined,
          detail:     undefined,
        })
      );
    });

    it('should snapshot userEmail and userRole at time of action', async () => {
      mockRepo.create.mockReturnValue({});
      await service.log(mockUser, AuditAction.DELETE_TASK, 3);

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userEmail: 'alice@test.com', 
          userRole:  Role.OWNER,       
        })
      );
    });

    it('should print to console', async () => {
      mockRepo.create.mockReturnValue({});
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      await service.log(mockUser, AuditAction.CREATE_TASK, 1);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('findAll()', () => {
    it('should return logs ordered by timestamp DESC', async () => {
      const logs = [{ id: 2 }, { id: 1 }];
      mockRepo.find.mockResolvedValue(logs);
      const result = await service.findAll();
      expect(mockRepo.find).toHaveBeenCalledWith({
        order: { timestamp: 'DESC' },
      });
      expect(result).toEqual(logs);
    });
  });
});