import { SetMetadata } from '@nestjs/common';

export const CacheTTL = (ttl: number): ReturnType<typeof SetMetadata> =>
  SetMetadata('cacheTTL', ttl);
