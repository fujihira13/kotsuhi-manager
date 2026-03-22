import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../../../domain/user/user.entity';
import { IUserRepository } from '../../../../domain/user/user.repository';
import { UserId } from '../../../../domain/user/value-objects/user-id.vo';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: UserId): Promise<UserEntity | null> {
    const record = await this.prisma.user.findUnique({
      where: { id: id.toString() },
    });
    if (!record) return null;
    return this.toEntity(record);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const record = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!record) return null;
    return this.toEntity(record);
  }

  async save(user: UserEntity): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id.toString() },
      create: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      update: {
        email: user.email,
        name: user.name,
        updatedAt: user.updatedAt,
      },
    });
  }

  async delete(id: UserId): Promise<void> {
    await this.prisma.user.delete({
      where: { id: id.toString() },
    });
  }

  private toEntity(record: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserEntity {
    return UserEntity.reconstruct({
      id: UserId.create(record.id),
      email: record.email,
      name: record.name,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
