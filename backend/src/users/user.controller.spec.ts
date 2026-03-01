import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Role } from '../auth/role.enum';

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: any;

  beforeEach(async () => {
    mockUserService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all users', async () => {
    const mockUsers = [{ id: 1, username: 'admin' }];
    mockUserService.findAll.mockResolvedValue(mockUsers);

    expect(await controller.findAll()).toEqual(mockUsers);
  });

  it('should create a new user', async () => {
    const userDto = { username: 'newuser', password: 'password', role: Role.Operator };
    mockUserService.create.mockResolvedValue({ id: 2, ...userDto });

    expect(await controller.create(userDto)).toEqual({ id: 2, ...userDto });
  });
});
