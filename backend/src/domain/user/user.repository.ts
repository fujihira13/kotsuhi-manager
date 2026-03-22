import { UserEntity } from './user.entity';
import { UserId } from './value-objects/user-id.vo';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface IUserRepository {
  findById(id: UserId): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<void>;
  delete(id: UserId): Promise<void>;
}
