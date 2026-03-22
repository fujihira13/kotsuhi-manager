import { UserId } from './value-objects/user-id.vo';

export interface UserProps {
  id: UserId;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserEntity {
  private readonly props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  static create(params: { email: string; name: string }): UserEntity {
    if (!params.email || !params.email.includes('@')) {
      throw new Error('Invalid email address');
    }
    if (!params.name || params.name.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }
    const now = new Date();
    return new UserEntity({
      id: UserId.generate(),
      email: params.email.toLowerCase().trim(),
      name: params.name.trim(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(props: UserProps): UserEntity {
    return new UserEntity(props);
  }

  get id(): UserId {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
