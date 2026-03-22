import { Inject, Injectable } from '@nestjs/common';
import { UserNotFoundError } from '../../../domain/user/errors/user-not-found.error';
import type { IUserRepository } from '../../../domain/user/user.repository';
import { USER_REPOSITORY } from '../../../domain/user/user.repository';
import { UserId } from '../../../domain/user/value-objects/user-id.vo';
import { GetUserQuery } from './get-user.query';

export interface GetUserResult {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUserQuery): Promise<GetUserResult> {
    const userId = UserId.create(query.userId);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError(query.userId);
    }

    return {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
