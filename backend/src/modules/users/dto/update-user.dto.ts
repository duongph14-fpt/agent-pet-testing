import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn(['admin', 'user'])
  role?: UserRole;
}
