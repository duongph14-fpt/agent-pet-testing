import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsIn(['admin', 'user'])
  role?: UserRole;
}
