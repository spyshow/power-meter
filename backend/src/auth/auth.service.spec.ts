import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserService: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUserService = {
      findOneByUsername: jest.fn(),
    };
    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate user with correct credentials', async () => {
    const username = 'admin';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const mockUser = { id: 1, username, password: hashedPassword, role: 'admin' };

    mockUserService.findOneByUsername.mockResolvedValue(mockUser);

    const result = await service.validateUser(username, password);

    expect(result).toEqual({ id: 1, username, role: 'admin' });
  });

  it('should return null for incorrect password', async () => {
    const username = 'admin';
    const password = 'wrongpassword';
    const hashedPassword = await bcrypt.hash('correctpassword', 10);
    const mockUser = { id: 1, username, password: hashedPassword, role: 'admin' };

    mockUserService.findOneByUsername.mockResolvedValue(mockUser);

    const result = await service.validateUser(username, password);

    expect(result).toBeNull();
  });

  it('should return a JWT token on login', async () => {
    const user = { id: 1, username: 'admin', role: 'admin' };
    
    const result = await service.login(user);

    expect(result).toEqual({
      access_token: 'mock-jwt-token',
    });
    expect(mockJwtService.sign).toHaveBeenCalledWith({
      username: user.username,
      sub: user.id,
      role: user.role,
    });
  });
});
