import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

// Global so any module can send mail without re-importing this one; it holds a
// single lazily-created SMTP transporter and no per-module state.
@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
