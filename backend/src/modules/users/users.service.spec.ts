import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('seeds users from the dummy dataset', () => {
    const users = service.findAll();
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toHaveProperty('id');
    expect(users[0]).toHaveProperty('email');
  });

  it('finds a user by id', () => {
    const [first] = service.findAll();
    expect(service.findOne(first.id)).toEqual(first);
  });

  it('throws when a user is not found', () => {
    expect(() => service.findOne('does-not-exist')).toThrow(NotFoundException);
  });

  it('creates a user with a generated id and default role', () => {
    const before = service.findAll().length;
    const created = service.create({
      name: 'New Person',
      email: 'new.person@example.com',
    });
    expect(created.id).toBeDefined();
    expect(created.role).toBe('user');
    expect(created.createdAt).toBeDefined();
    expect(service.findAll().length).toBe(before + 1);
  });

  it('updates an existing user', () => {
    const created = service.create({
      name: 'Temp',
      email: 'temp@example.com',
      role: 'user',
    });
    const updated = service.update(created.id, { name: 'Renamed', role: 'admin' });
    expect(updated.name).toBe('Renamed');
    expect(updated.role).toBe('admin');
    expect(updated.email).toBe('temp@example.com');
  });

  it('throws when updating a missing user', () => {
    expect(() => service.update('missing', { name: 'x' })).toThrow(
      NotFoundException,
    );
  });

  it('removes a user', () => {
    const created = service.create({
      name: 'ToDelete',
      email: 'delete@example.com',
    });
    service.remove(created.id);
    expect(() => service.findOne(created.id)).toThrow(NotFoundException);
  });

  it('throws when removing a missing user', () => {
    expect(() => service.remove('missing')).toThrow(NotFoundException);
  });
});
