import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ENV } from "@src/env";
import * as Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private redisClient: Redis.Redis;

  constructor() {
    this.redisClient = new Redis.Redis({
      host: ENV.redis.host,
      port: ENV.redis.port,
      password: ENV.redis.password,
      username: ENV.redis.username,
      maxRetriesPerRequest: 1,
      ...(!ENV.redis.host?.startsWith("localhost")
        ? { tls: { rejectUnauthorized: false } }
        : {}),
    });

    this.redisClient.on("error", (err) => {
      console.error("Redis Error:", err);
    });
  }

  async setKey(key: string, value: any, ttl: number): Promise<void> {
    try {
      await this.redisClient.set(key, JSON.stringify(value), "EX", ttl);
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
    }
  }

  async getKey(key: string): Promise<any> {
    try {
      const data = await this.redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async delKey(pattern: string): Promise<void> {
    try {
      const keys = await this.redisClient.keys(pattern);
      if (keys.length > 0) {
        await this.redisClient.del(keys);
      }
    } catch (error) {
      console.error(`Error deleting keys matching ${pattern}:`, error);
    }
  }

  async incr(key: string): Promise<number> {
    return this.redisClient.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.redisClient.expire(key, seconds);
  }

  onModuleDestroy() {
    this.redisClient.disconnect();
  }
}
