import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RoleSeeder {
  constructor(private prisma: PrismaService) {}
  private logger = new Logger(RoleSeeder.name);

  async seedRoles() {
    const roles = await this.prisma.role.findMany();
    if (roles.length === 0) {
      this.logger.log('Seeding roles...');
      await this.prisma.role.createMany({
        data: [
          { name: 'admin', description: 'Admin role with full access' },
          { name: 'user', description: 'User role with limited access' },
          { name: 'guest', description: 'Guest role with read-only access' },
        ],
      });
      this.logger.log('Roles seeded successfully');
    } else {
      this.logger.log('Roles already exist, skipping seeding');
    }
  }
}
