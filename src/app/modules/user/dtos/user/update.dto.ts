import { ApiProperty } from '@nestjs/swagger';
import { BaseUpdateDTO } from '@src/app/base';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class UpdateRolesDTO {
  @ApiProperty({
    type: String,
    required: true,
    example: 'c10ee33d-20a7-4689-8f80-929963400f7d',
  })
  @IsNotEmpty()
  @IsUUID()
  readonly id!: string;

  @ApiProperty({
    type: Boolean,
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isDeleted!: boolean;
}

export class UpdateUserDTO extends BaseUpdateDTO {
  @ApiProperty({
    type: String,
    required: false,
    example: 'Galib',
  })
  @IsOptional()
  @IsString()
  readonly firstName!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: 'Test',
  })
  @IsOptional()
  @IsString()
  readonly lastName!: string;

  //   @ApiProperty({
  //     type: String,
  //     required: false,
  //     example: 'zahid@gmail.com',
  //   })
  //   @IsOptional()
  //   @IsEmail()
  //   readonly email!: string;

  @ApiProperty({
    type: String,
    required: false,
    example: '123456',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  readonly password!: string;

  @ApiProperty({
    type: [UpdateRolesDTO],
    required: false,
    example: [
      {
        id: '1e276fa4-bab1-4bda-bee2-8bc509960467',
      },
      {
        id: 'c10ee33d-20a7-4689-8f80-929963400f7d',
        isDeleted: true,
      },
    ],
  })
  @ValidateNested()
  @Type(() => UpdateRolesDTO)
  @IsOptional()
  readonly roleIds!: UpdateRolesDTO[];
}
