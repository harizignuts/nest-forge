import { Inject, Injectable } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { CACHE_CLIENT } from './cache.constants';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_CLIENT) private readonly client: Redis) {}

  async ping(): Promise<string> {
    return this.client.ping();
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (data === null) return null;

    try {
      return JSON.parse(data) as T;
    } catch {
      return data as unknown as T;
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<'OK'> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    if (ttl !== undefined) {
      return this.client.set(key, stringValue, 'EX', ttl);
    }

    return this.client.set(key, stringValue);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async delMany(keys: string[]): Promise<number> {
    if (!keys.length) return 0;
    return this.client.del(...keys);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const values = await this.client.mget(...keys);

    return values.map((v) => {
      if (v === null) return null;

      try {
        return JSON.parse(v) as T;
      } catch {
        return v as unknown as T;
      }
    });
  }

  async delByPattern(pattern: string): Promise<void> {
    const stream = this.client.scanStream({
      match: pattern,
      count: 100,
    });

    return new Promise((resolve, reject) => {
      stream.on('data', (keys: string[]) => {
        if (!keys.length) return;

        const pipeline = this.client.pipeline();
        keys.forEach((key) => pipeline.del(key));

        void pipeline.exec().catch((err: unknown) => {
          const error = err instanceof Error ? err : new Error(String(err));

          stream.destroy(error);
        });
      });

      stream.on('end', () => resolve());

      stream.on('error', (err) => {
        reject(err instanceof Error ? err : new Error(String(err)));
      });
    });
  }
}
