import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../../../domain/user/user.entity';
import type { IUserRepository } from '../../../domain/user/user.repository';
import { USER_REPOSITORY } from '../../../domain/user/user.repository';
import { CreateUserCommand } from './create-user.command';

export interface CreateUserResult {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResult> {
    const existing = await this.userRepository.findByEmail(command.email);
    if (existing) {
      throw new Error(`Email already in use: ${command.email}`);
    }

    const user = UserEntity.create({ email: command.email, name: command.name });
    await this.userRepository.save(user);

    return {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }
}
