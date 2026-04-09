import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { RolesModule } from './roles';

@Module({
  imports: [HealthModule, RolesModule],
})
export class ApiModule {}
