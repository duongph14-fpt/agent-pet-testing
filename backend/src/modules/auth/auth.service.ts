import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { AppConfig } from '../../config/configuration';
import { PublicUser, User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

// Claims carried inside the signed access token.
export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: User['role'];
  iat: number;
  exp: number;
}

export interface LoginResult {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: PublicUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {}

  // Checks the supplied credentials and returns the public user when they match.
  validateUser(email: string, password: string): PublicUser | null {
    const user = this.usersService.findByEmail(email);
    if (!user || !user.password) {
      return null;
    }
    if (!AuthService.constantTimeEquals(user.password, password)) {
      return null;
    }
    const { password: _password, ...publicUser } = user;
    return publicUser;
  }

  // Authenticates a login request and issues a signed access token.
  login(dto: LoginDto): LoginResult {
    const user = this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const ttl = this.configService.get('authTokenTtl', { infer: true });
    const issuedAt = Math.floor(Date.now() / 1000);
    const payload: AuthTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: issuedAt,
      exp: issuedAt + ttl,
    };

    return {
      accessToken: this.sign(payload),
      tokenType: 'Bearer',
      expiresIn: ttl,
      user,
    };
  }

  // Verifies a token's signature and expiry, returning its claims.
  verifyToken(token: string): AuthTokenPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException('Malformed token');
    }
    const [encodedHeader, encodedPayload, signature] = parts;
    const expected = this.signature(`${encodedHeader}.${encodedPayload}`);
    if (!AuthService.constantTimeEquals(signature, expected)) {
      throw new UnauthorizedException('Invalid token signature');
    }

    let payload: AuthTokenPayload;
    try {
      payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString('utf8'),
      ) as AuthTokenPayload;
    } catch {
      throw new UnauthorizedException('Malformed token payload');
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Token has expired');
    }
    return payload;
  }

  private sign(payload: AuthTokenPayload): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = AuthService.base64url(JSON.stringify(header));
    const encodedPayload = AuthService.base64url(JSON.stringify(payload));
    const signature = this.signature(`${encodedHeader}.${encodedPayload}`);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private signature(data: string): string {
    const secret = this.configService.get('authSecret', { infer: true });
    return createHmac('sha256', secret).update(data).digest('base64url');
  }

  private static base64url(value: string): string {
    return Buffer.from(value, 'utf8').toString('base64url');
  }

  private static constantTimeEquals(a: string, b: string): boolean {
    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);
    if (bufferA.length !== bufferB.length) {
      return false;
    }
    return timingSafeEqual(bufferA, bufferB);
  }
}
