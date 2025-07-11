import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { ENV } from "@src/env";
import { Observable, of } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { RedisService } from "../modules/redis/redisCache.service";

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    @Inject(RedisService) private readonly redisService: RedisService,
    private readonly reflector: Reflector
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const handler = context.getHandler();
    const request: Request = context.switchToHttp().getRequest();

    const revalidateKeys = this.reflector.get<string[]>(
      "cacheRevalidateKeys",
      handler
    );

    // Handle cache invalidation
    if (revalidateKeys?.length) {
      for (const reKey of revalidateKeys) {
        const pattern = `${ENV.config.appEnv}_${reKey}*`;
        this.logger.debug(`Invalidating cache with pattern: ${pattern}`);
        await this.redisService.delKey(pattern);
      }
      return next.handle();
    }

    const cacheKeyPrefix = this.reflector.get<string>("cacheKey", handler);
    if (!cacheKeyPrefix) {
      this.logger.error(`Cache key not found, API End point: ${request?.url}`);
      return next.handle();
    }
    const key = this.getCacheKey(context, cacheKeyPrefix);
    const ttl = this.reflector.get<number>("cacheTTL", handler) || 300;

    // Try serving from cache
    try {
      const cached = await this.redisService.getKey(key);
      if (cached) {
        this.logger.debug(`Cache hit for key: ${key}`);
        return of(cached);
      }
    } catch (err) {
      this.logger.error(`Redis getKey failed: ${err.message}`);
    }

    // Set cache after response
    return next.handle().pipe(
      tap(async (response) => {
        try {
          await this.redisService.setKey(key, response, ttl);
          this.logger.debug(`Cache set for key: ${key} with TTL: ${ttl}s`);
        } catch (err) {
          this.logger.error(`Redis setKey failed: ${err.message}`);
        }
      }),
      catchError((err) => {
        this.logger.error(`Handler error: ${err.message}`);
        throw err;
      })
    );
  }

  private getCacheKey(context: ExecutionContext, prefix: string): string {
    const { method, url, query, params } = context.switchToHttp().getRequest();
    let key = `${ENV.config.nodeEnv}_${prefix}`;

    Object.entries(params).forEach(([k, v]) => {
      key = key.replace(`{${k}}`, String(v));
    });

    key += `_${method}:${url}`;

    if (Object.keys(query).length) {
      key += `?${new URLSearchParams(query).toString()}`;
    }

    return key;
  }
}
