import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { DRIZZLE_PROVIDER } from '../database/constants';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let mockDb: any;

  beforeEach(async () => {
    mockDb = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      returning: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: DRIZZLE_PROVIDER,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user with hashed password', async () => {
    const username = 'testuser';
    const password = 'testpassword';
    const role = 'admin';

    await service.create(username, password, role);

    expect(mockDb.insert).toHaveBeenCalled();
    const values = mockDb.values.mock.calls[0][0];
    expect(values.username).toBe(username);
    expect(values.role).toBe(role);
    expect(await bcrypt.compare(password, values.password)).toBe(true);
  });

  it('should find a user by username', async () => {
    const username = 'testuser';
    mockDb.limit.mockResolvedValue([{ username, password: 'hashedpassword' }]);

    const user = await service.findOneByUsername(username);

    expect(mockDb.select).toHaveBeenCalled();
    expect(user.username).toBe(username);
  });
});
