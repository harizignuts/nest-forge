import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RoleSeeder } from './seeders';

@Module({
  providers: [PrismaService, RoleSeeder],
  exports: [PrismaService, RoleSeeder],
})
export class DatabaseModule {
  constructor(private readonly roleSeeder: RoleSeeder) {}

  async onApplicationBootstrap() {
    await this.roleSeeder.seedRoles();
  }
}
