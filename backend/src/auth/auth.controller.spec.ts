import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      validateUser: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should login and return access token', async () => {
    const username = 'admin';
    const password = 'password123';
    const mockUser = { id: 1, username, role: 'admin' };
    const mockToken = { access_token: 'mock-token' };

    mockAuthService.validateUser.mockResolvedValue(mockUser);
    mockAuthService.login.mockResolvedValue(mockToken);

    const result = await controller.login({ username, password });

    expect(result).toEqual(mockToken);
    expect(mockAuthService.validateUser).toHaveBeenCalledWith(username, password);
    expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
  });

  it('should throw UnauthorizedException for invalid credentials', async () => {
    mockAuthService.validateUser.mockResolvedValue(null);

    await expect(controller.login({ username: 'user', password: 'wrong' }))
      .rejects.toThrow(UnauthorizedException);
  });
});
