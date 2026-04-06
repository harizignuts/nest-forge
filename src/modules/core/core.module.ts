import { Global, Module } from '@nestjs/common';
import { ConfigModule } from './config';
import { DatabaseModule } from './database';
import { MailModule } from './mail';
import { RedisModule } from './cache';

@Global()
@Module({
  imports: [ConfigModule, DatabaseModule, MailModule, RedisModule],
  exports: [ConfigModule, DatabaseModule, MailModule, RedisModule],
})
export class CoreModule {}
