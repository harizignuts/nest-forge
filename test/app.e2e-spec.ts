import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const adapter = new FastifyAdapter();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(adapter);

    await app.init();

    await adapter.getInstance().ready();
  });

  it('/ (GET) - Redirects to health', () => {
    return request(app.getHttpServer()).get('/').expect(302).expect('location', 'health');
  });

  it('/health (GET) - Returns health status', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect((res.body as { status: string }).status).toBe('ok');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
