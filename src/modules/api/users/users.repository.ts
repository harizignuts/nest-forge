import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database';
import { Prisma, User } from '@generated/prisma';

const publicColumns = {
  id: true,
  name: true,
  email: true,
  roleId: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.UserSelect;

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly activeFilter = { deletedAt: null };

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.upsert({
      where: { email: data.email },
      update: { ...data, createdAt: new Date(), deletedAt: null },
      create: data,
    });
  }

  async findOneActiveById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { id, ...this.activeFilter },
    });
  }

  async findOneActiveByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email, ...this.activeFilter },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User | null> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch {
      return null;
    }
  }

  async softDelete(id: string): Promise<User | null> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch {
      return null;
    }
  }

  async findAllActiveOffset({
    page = 1,
    limit = 10,
    orderBy = 'desc',
  }: {
    page?: number;
    limit?: number;
    orderBy?: 'asc' | 'desc';
  }): Promise<{ data: Prisma.UserGetPayload<{ select: typeof publicColumns }>[]; total: number }> {
    const offset = (Math.max(page, 1) - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: this.activeFilter,
        select: {
          ...publicColumns,
          role: true,
        },
        skip: offset,
        take: limit,
        orderBy: { id: orderBy },
      }),
      this.prisma.user.count({
        where: this.activeFilter,
      }),
    ]);

    return { data, total };
  }

  async findAllActiveCursor({
    limit,
    cursor,
    orderBy = 'desc',
  }: {
    limit: number;
    cursor?: string;
    orderBy?: 'asc' | 'desc';
  }): Promise<{ data: Prisma.UserGetPayload<{ select: typeof publicColumns }>[]; nextCursor: string | null }> {
    const items = await this.prisma.user.findMany({
      where: this.activeFilter,
      select: {
        ...publicColumns,
        role: true,
      },
      take: limit + 1,
      orderBy: { id: orderBy },
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    let nextCursor: string | null = null;
    if (items.length > limit) {
      const popped = items.pop();
      nextCursor = popped?.id ?? null;
    }

    return { data: items, nextCursor };
  }
}
