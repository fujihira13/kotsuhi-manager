import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { CreateUserUseCase } from '../../../application/user/create-user/create-user.use-case';
import { GetUserUseCase } from '../../../application/user/get-user/get-user.use-case';
import { UserNotFoundError } from '../../../domain/user/errors/user-not-found.error';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user.response.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const result = await this.createUserUseCase.execute({
      email: dto.email,
      name: dto.name,
    });
    return {
      id: result.id,
      email: result.email,
      name: result.name,
      createdAt: result.createdAt,
    };
  }

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<UserResponseDto> {
    try {
      const result = await this.getUserUseCase.execute({ userId: id });
      return {
        id: result.id,
        email: result.email,
        name: result.name,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
