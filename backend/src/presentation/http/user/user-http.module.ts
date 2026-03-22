import { Module } from '@nestjs/common';
import { CreateUserUseCase } from '../../../application/user/create-user/create-user.use-case';
import { GetUserUseCase } from '../../../application/user/get-user/get-user.use-case';
import { USER_REPOSITORY } from '../../../domain/user/user.repository';
import { PrismaUserRepository } from '../../../infrastructure/persistence/prisma/user/prisma-user.repository';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [
    // Driven Adapter: IUserRepository → PrismaUserRepository
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    CreateUserUseCase,
    GetUserUseCase,
  ],
})
export class UserHttpModule {}
