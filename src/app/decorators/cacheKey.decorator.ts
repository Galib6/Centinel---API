import { SetMetadata } from '@nestjs/common';

export const CacheKey = (key: string): ReturnType<typeof SetMetadata> =>
  SetMetadata('cacheKey', key);
