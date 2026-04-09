import { CacheService } from '@core/cache';
import { User } from '@generated/prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersCache {
  private readonly LIST_TTL = 60; // 1 minute
  private readonly USER_TTL = 900; // 15 minutes
  private readonly LIST_VERSION_KEY = 'users:list:version';

  constructor(private readonly cacheService: CacheService) {}

  private async getVersion(): Promise<number> {
    const v = await this.cacheService.get<number>(this.LIST_VERSION_KEY);
    return v || 1;
  }

  async invalidateUserLists(): Promise<void> {
    await this.cacheService.incr(this.LIST_VERSION_KEY);
  }
  async invalidateUser(id: string): Promise<void> {
    await this.cacheService.del(`user:${id}`);
  }

  async getUsersByIds(ids: string[]): Promise<(User | null)[]> {
    if (!ids.length) return [];
    return this.cacheService.mget<User>(ids.map((id) => `user:${id}`));
  }

  async setUsers(users: User[]): Promise<void> {
    await Promise.all(
      users.map((u) => {
        const jitter = Math.floor(Math.random() * 15); // Prevent cache stampede
        return this.cacheService.set(`user:${u.id}`, u, this.USER_TTL + jitter);
      }),
    );
  }

  async setUser(user: User): Promise<void> {
    await this.cacheService.set(`user:${user.id}`, user, this.USER_TTL);
  }

  async getUserList(page: number, limit: number, orderBy: string) {
    const v = await this.getVersion();
    return this.cacheService.get<{ ids: string[]; total: number }>(`users:offset:v${v}:${page}:${limit}:${orderBy}`);
  }

  async setUserList(page: number, limit: number, orderBy: string, ids: string[], total: number) {
    const v = await this.getVersion();
    await this.cacheService.set(`users:offset:v${v}:${page}:${limit}:${orderBy}`, { ids, total }, this.LIST_TTL);
  }

  async getCursorList(cursor: string | undefined, limit: number, orderBy: string) {
    const v = await this.getVersion();
    return this.cacheService.get<{ ids: string[]; nextCursor: string | null }>(
      `users:cursor:v${v}:${cursor || 'start'}:${limit}:${orderBy}`,
    );
  }

  async setUserCursorList(
    cursor: string | undefined,
    limit: number,
    orderBy: string,
    ids: string[],
    nextCursor: string | null,
  ) {
    const v = await this.getVersion();
    await this.cacheService.set(
      `users:cursor:v${v}:${cursor || 'start'}:${limit}:${orderBy}`,
      { ids, nextCursor },
      this.LIST_TTL,
    );
  }

  async getUserPermissions(userId: string): Promise<{ role: string; permissions: string[] } | null> {
    return this.cacheService.get<{ role: string; permissions: string[] }>(`user:${userId}:permissions`);
  }

  async setUserPermissions(userId: string, data: { role: string; permissions: string[] }): Promise<void> {
    await this.cacheService.set(`user:${userId}:permissions`, data, this.USER_TTL);
  }

  async invalidateUserPermissions(userId: string): Promise<void> {
    await this.cacheService.del(`user:${userId}:permissions`);
  }
}
