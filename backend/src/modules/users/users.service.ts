import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import seedUsers from './data/users.json';

@Injectable()
export class UsersService {
  // Seeded from the dummy dataset and kept in memory for the lifetime of the app.
  private readonly users: User[] = (seedUsers as User[]).map((user) => ({
    ...user,
  }));

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User {
    const user = this.users.find((candidate) => candidate.id === id);
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return user;
  }

  create(dto: CreateUserDto): User {
    const user: User = {
      id: randomUUID(),
      name: dto.name,
      email: dto.email,
      role: dto.role ?? 'user',
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }

  update(id: string, dto: UpdateUserDto): User {
    const user = this.findOne(id);
    if (dto.name !== undefined) {
      user.name = dto.name;
    }
    if (dto.email !== undefined) {
      user.email = dto.email;
    }
    if (dto.role !== undefined) {
      user.role = dto.role;
    }
    return user;
  }

  remove(id: string): void {
    const index = this.users.findIndex((candidate) => candidate.id === id);
    if (index === -1) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    this.users.splice(index, 1);
  }
}
