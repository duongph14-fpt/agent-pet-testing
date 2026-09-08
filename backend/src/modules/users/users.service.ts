import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { hashPassword } from '../../common/password';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PublicUser, User } from './user.entity';
import seedUsers from './data/users.json';

@Injectable()
export class UsersService {
  // Seeded from the dummy dataset and kept in memory for the lifetime of the app.
  private readonly users: User[] = (seedUsers as User[]).map((user) => ({
    ...user,
  }));

  findAll(): PublicUser[] {
    return this.users.map((user) => this.toPublic(user));
  }

  findOne(id: string): PublicUser {
    return this.toPublic(this.getEntity(id));
  }

  // Returns the full record (including the password) — for authentication only.
  findByEmail(email: string): User | undefined {
    const normalized = email.toLowerCase();
    return this.users.find(
      (candidate) => candidate.email.toLowerCase() === normalized,
    );
  }

  create(dto: CreateUserDto): PublicUser {
    const user: User = {
      id: randomUUID(),
      name: dto.name,
      email: dto.email,
      // Hashed at rest; empty when no password is supplied (login disabled).
      password: dto.password ? hashPassword(dto.password) : '',
      role: dto.role ?? 'user',
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);
    return this.toPublic(user);
  }

  update(id: string, dto: UpdateUserDto): PublicUser {
    const user = this.getEntity(id);
    if (dto.name !== undefined) {
      user.name = dto.name;
    }
    if (dto.email !== undefined) {
      user.email = dto.email;
    }
    if (dto.password !== undefined) {
      user.password = hashPassword(dto.password);
    }
    if (dto.role !== undefined) {
      user.role = dto.role;
    }
    return this.toPublic(user);
  }

  remove(id: string): void {
    const index = this.users.findIndex((candidate) => candidate.id === id);
    if (index === -1) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    this.users.splice(index, 1);
  }

  private getEntity(id: string): User {
    const user = this.users.find((candidate) => candidate.id === id);
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return user;
  }

  private toPublic({ password: _password, ...publicUser }: User): PublicUser {
    return publicUser;
  }
}
