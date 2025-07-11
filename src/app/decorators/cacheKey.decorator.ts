import { SetMetadata } from '@nestjs/common';

export const CacheKey = (key: string) => SetMetadata('cacheKey', key);
