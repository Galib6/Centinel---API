import { SetMetadata } from '@nestjs/common';

export const CacheTTL = (ttl: number) => SetMetadata('cacheTTL', ttl);
