import { Global, Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { MailModule } from './mail/mail.module';

@Global()
@Module({
  imports: [ConfigModule, DatabaseModule, MailModule],
  exports: [ConfigModule, DatabaseModule, MailModule],
})
export class CoreModule {}
