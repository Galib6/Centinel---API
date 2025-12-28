import { ApiProperty } from '@nestjs/swagger';
import { BaseCreateDTO } from '@src/app/base';
import { IsNotEmptyArray } from '@src/app/decorators';

export class AddPermissionsDTO extends BaseCreateDTO {
  @ApiProperty({
    type: [String],
    required: true,
    example: ['06f3d108-a2c6-471f-b7ba-0e88077f64ec', '6dc90d80-a619-4ab8-8433-95c6e0635495'],
  })
  @IsNotEmptyArray()
  // @IsUUIDArray()
  permissionIds!: string[];
}
