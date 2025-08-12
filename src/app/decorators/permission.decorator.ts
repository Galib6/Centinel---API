import { SetMetadata } from '@nestjs/common';

export const Permission = (permission: string): ReturnType<typeof SetMetadata> =>
  SetMetadata('permission', permission);
