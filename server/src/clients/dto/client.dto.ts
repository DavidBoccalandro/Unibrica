import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ClientDTO {
  @IsNumber()
  @IsNotEmpty()
  clientId: number;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  code: string;
}
