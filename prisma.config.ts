import 'dotenv/config';
import { defineConfig, env } from '@prisma/config';

export default defineConfig({
  schema: './prisma/models',
  datasource: {
    // Adding a fallback string prevents the 'PrismaConfigEnvError' during Docker build
    url: env('DATABASE_URL') ?? 'postgresql://dummy:dummy@localhost:5432/dummy',
  },
  migrations: {
    path: './prisma/migrations',
  },
});
