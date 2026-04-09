import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/database/prisma.service';
import { Permission, Prisma, Role } from '@generated/prisma';

@Injectable()
export class RolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createRole(newRole: Prisma.RoleCreateInput): Promise<Role> {
    return this.prisma.role.create({ data: newRole });
  }

  async findRoleByName(roleName: string): Promise<Role | null> {
    return this.prisma.role.findFirst({
      where: { name: roleName },
    });
  }

  async findAllRoles(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  async findRoleById(roleId: string): Promise<Role | null> {
    return this.prisma.role.findFirst({
      where: { id: roleId },
    });
  }

  async createPermission(permission: Prisma.PermissionCreateInput): Promise<Permission> {
    return this.prisma.permission.create({ data: permission });
  }

  async findPermissionBySlug(slug: string): Promise<Permission | null> {
    return this.prisma.permission.findFirst({
      where: { slug },
    });
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.prisma.permission.findMany();
  }
}
