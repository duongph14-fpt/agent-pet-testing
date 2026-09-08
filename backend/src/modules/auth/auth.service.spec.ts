import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  const config: Record<string, unknown> = {
    authSecret: 'test-secret',
    authTokenTtl: 3600,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        {
          provide: ConfigService,
          useValue: { get: (key: string) => config[key] },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('validates a user with correct credentials', () => {
    const result = service.validateUser(
      'ada.lovelace@example.com',
      'ada-password-1',
    );
    expect(result).not.toBeNull();
    expect(result?.email).toBe('ada.lovelace@example.com');
    expect((result as Record<string, unknown>).password).toBeUndefined();
  });

  it('rejects a user with a wrong password', () => {
    expect(
      service.validateUser('ada.lovelace@example.com', 'wrong'),
    ).toBeNull();
  });

  it('rejects an unknown email', () => {
    expect(service.validateUser('nobody@example.com', 'x')).toBeNull();
  });

  it('issues a verifiable token on login', () => {
    const result = service.login({
      email: 'ada.lovelace@example.com',
      password: 'ada-password-1',
    });
    expect(result.tokenType).toBe('Bearer');
    expect(result.expiresIn).toBe(3600);
    expect(result.user.email).toBe('ada.lovelace@example.com');

    const payload = service.verifyToken(result.accessToken);
    expect(payload.sub).toBe(result.user.id);
    expect(payload.email).toBe('ada.lovelace@example.com');
  });

  it('throws on invalid login credentials', () => {
    expect(() =>
      service.login({ email: 'ada.lovelace@example.com', password: 'nope' }),
    ).toThrow(UnauthorizedException);
  });

  it('rejects a tampered token', () => {
    const result = service.login({
      email: 'ada.lovelace@example.com',
      password: 'ada-password-1',
    });
    const tampered = `${result.accessToken}tampered`;
    expect(() => service.verifyToken(tampered)).toThrow(UnauthorizedException);
  });

  it('does not authenticate users created without a password', () => {
    const created = usersService.create({
      name: 'No Password',
      email: 'no.password@example.com',
    });
    expect(created).toBeDefined();
    expect(service.validateUser('no.password@example.com', '')).toBeNull();
  });
});
